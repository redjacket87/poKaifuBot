import * as rimraf from 'rimraf';
import { ContextMessageUpdate } from 'telegraf';
import * as Composer from 'telegraf/composer';
import * as session from 'telegraf/session';
import * as Stage from 'telegraf/stage';
import * as Markup from 'telegraf/markup';
import * as WizardScene from 'telegraf/scenes/wizard';

import { bot } from '../..';
import { Video } from './video';
import { existsSync, mkdirSync } from 'fs';

const handleVideo = async (ctx: ContextMessageUpdate) => {
  // @ts-ignore
  const {id: sessionId, count: sessionCount = 1} = ctx.session;
  const { file_id } = ctx.message.video;

  const filesDir = __dirname + `/${sessionId}`;

  if(!existsSync(filesDir)) {
    mkdirSync(filesDir, '0711')
  }

  try {
    await ctx.reply('Сохраняем файл...');
    const fileMeta = await ctx.telegram.getFile(file_id);
    const fileName = 'ffff.mp4';
    const path = `https://api.telegram.org/file/bot${bot.token}/${fileMeta.file_path}`;
    await Video.downloadVideo(path, `${filesDir}/${fileName}`);

    await ctx.reply('Обрабатываем файл...');
    const videoHash = new Video(`${filesDir}/${fileName}`);

    await videoHash.setHash();
    await ctx.reply('Отправляем файл...');
    await ctx.replyWithVideo({source: `${filesDir}/${fileName}`});

    rimraf(filesDir, async () => {
      await ctx.reply('Пользуйся, дорогой');
    });
  } catch(error) {
    const { message = 'Unknown' } = error;

    await ctx.reply(`Произошла ошибка: ${message}`)
  }
};

const superWizardLauncher = (): void => {
  const stepHandler = new Composer();

  stepHandler.action('1', async (ctx) => {
    await ctx.reply('Кидай видео, брат');
    return ctx.wizard.next();
  });

  stepHandler.action('много', async (ctx) => {
    await ctx.reply('Введи число, брат');
    return ctx.wizard.next();
  });

  const startScene = new WizardScene('start',
      async (ctx) => {
        ctx.session.id = new Date().toISOString();

        await ctx.reply('Сколько хочешь, брат?', Markup.inlineKeyboard([
          Markup.callbackButton('Хочу 1 видео️', '1'),
          Markup.callbackButton('Хочу много видео', 'много')
        ]).extra());
        return ctx.wizard.next()
      },
      stepHandler,
      async (ctx) => {
        const {video, text} = ctx.message;

        if (video) {
          await handleVideo(ctx);
        } else if (!isNaN(Number(text))) {
          ctx.session.count = text;
          await ctx.reply('Теперь кидай видео')
          ctx.wizard.next();
        }

        return ctx.scene.leave();
      },
      async (ctx) => {
        const {video} = ctx.message;

        if (video) {
          await handleVideo(ctx);
        }

        return ctx.scene.leave();
      },
  );

  const stage = new Stage().register(startScene);
  bot.use(session());
  bot.use(stage.middleware());
  // @ts-ignore
  bot.start((ctx) => ctx.scene.enter('start'));
};

export const videoInitializer = (): void => {
  superWizardLauncher();

  bot.on('text', async ctx => {
    await ctx.reply( 'Либо кидай видео либо введи /start');
  });

  bot.on('video', async ctx => {
    await handleVideo(ctx);
  });
};
