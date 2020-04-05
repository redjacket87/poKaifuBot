import Telegraf from 'telegraf';
import {token} from '../config';
import { videoInitializer } from './commands/video';

export const bot = new Telegraf(token);

videoInitializer();
bot.launch();
