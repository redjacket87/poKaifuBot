import { bot } from '../../bot';
import { VideoHashWrapper } from './video-hash';
import { existsSync, mkdirSync, readdirSync } from 'fs';
import * as rimraf from 'rimraf';

export const videoInitializer = (): void => {
  bot.on('text', async message => {
    const { id: chatId } = message.chat;

    await bot.sendMessage(chatId, 'Давай кидай видео');
  });

  bot.on('video', async message => {
    const { chat, video } = message;
    const { file_id } = video;

    const filesDir = __dirname + '/files';

    if(!existsSync(filesDir)) {
      mkdirSync(filesDir, '0711')
    }

    try {
      await bot.sendMessage(chat.id, 'Сохраняем файл...');
      await bot.downloadFile(file_id, filesDir);
      await bot.sendMessage(chat.id, 'Обрабатываем файл...');

      const fileName = readdirSync(filesDir)[0];
      const videoHash = new VideoHashWrapper(`${filesDir}/${fileName}`);

      await videoHash.setHash();
      await bot.sendMessage(chat.id, 'Отправляем файл...');
      await bot.sendVideo(chat.id, `${filesDir}/${fileName}`);

      rimraf(filesDir, async () => {
        await bot.sendMessage(chat.id, 'Пользуйся, дорогой');
      });
    } catch(error) {
      const { message = 'Unknown' } = error;

      await bot.sendMessage(chat.id, `Произошла ошибка: ${message}`);
    }
  });
};
