import Telegraf from 'telegraf';
import {token} from '../config';
import {VideoInitializer} from './commands/video';
import {BotContext} from "./commands/video/types";

export const bot = new Telegraf<BotContext>(token);

new VideoInitializer(bot).initialize();
bot.launch().then();
