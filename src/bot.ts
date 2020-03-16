import * as TelegramBot from 'node-telegram-bot-api';

import {token} from '../config'

export const bot = new TelegramBot(token, {polling: true});
