import Telegraf from 'telegraf';
import {token} from '../config';
import { VideoInitializer } from './commands/video';

export const bot = new Telegraf(token);

new VideoInitializer(bot).initialize();
bot.launch();
