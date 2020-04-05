import * as rimraf from 'rimraf';
import Telegraf, { ContextMessageUpdate } from 'telegraf';
import * as Composer from 'telegraf/composer';
import * as session from 'telegraf/session';
import * as Stage from 'telegraf/stage';
import * as Markup from 'telegraf/markup';
import * as WizardScene from 'telegraf/scenes/wizard';
import { Video } from './video';
import { existsSync, mkdirSync, rename } from 'fs';

export class VideoInitializer {
  bot: Telegraf<ContextMessageUpdate> = null;

  constructor(bot: Telegraf<ContextMessageUpdate>) {
    this.bot = bot;
  }

  public initialize(): void{
    this.startLauncher();

    this.bot.on('text', async ctx => {
      await ctx.reply( 'Либо кидай видео либо введи /start');
    });

    this.bot.on('video', async ctx => {
      await this.handleVideo(ctx);
    });
  };

  private async handleVideo(ctx: ContextMessageUpdate) {
    // @ts-ignore
    const {count: filesCount = 1} = ctx.session;
    const sessionId = new Date().toISOString();
    const { file_id } = ctx.message.video;

    const filesDir = __dirname + `/${sessionId}`;

    if(!existsSync(filesDir)) {
      mkdirSync(filesDir, '0711')
    }

    await ctx.reply('Сохраняем видео...');

    try {
      const fileMeta = await ctx.telegram.getFile(file_id);
      const {file_path} = fileMeta;
      const fileExtension = file_path.slice(file_path.indexOf('.'));
      let fileName = `${filesDir}/${sessionId}[0]${fileExtension}`;

      const path = `https://api.telegram.org/file/bot${this.bot.token}/${file_path}`;
      await Video.downloadVideo(path, fileName);

      for (let i = 1; i <= filesCount; i++) {
        await ctx.reply(`Обрабатываем ${i} копию...`);
        const renamedFile = fileName.replace(`[${i-1}]`, `[${i}]`);
        await rename(fileName, renamedFile,(err) => {
          if ( err ) throw err;
        });
        fileName = renamedFile;
        const videoHash = new Video(fileName);
        await videoHash.setHash();
        await ctx.reply(`Отправляем ${i} копию...`);
        await ctx.replyWithVideo({source: fileName});
      }

      rimraf(filesDir, async () => {
        await ctx.reply('Пользуйся, дорогой');
      });
    } catch(error) {
      const { message = 'Unknown' } = error;

      await ctx.reply(`Произошла ошибка: ${message}`)
    }
  };

  startLauncher(): void {
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
            await this.handleVideo(ctx);
          } else if (!isNaN(Number(text))) {
            ctx.session.count = Number(text);
            await ctx.reply('Теперь кидай видео')
            ctx.wizard.next();
          }

          return ctx.scene.leave();
        },
        async (ctx) => {
          const {video} = ctx.message;

          if (video) {
            await this.handleVideo(ctx);
          }

          return ctx.scene.leave();
        },
    );

    const stage = new Stage().register(startScene);
    this.bot.use(session());
    this.bot.use(stage.middleware());
    // @ts-ignore
    this.bot.start((ctx) => ctx.scene.enter('start'));
  }
}
