import {ContextMessageUpdate} from 'telegraf';

export type BotContext = ContextMessageUpdate & {
    session: {
        filesCount: number;
        from: From;
    }
};

export enum From {
    Single = 'single',
    Multiple = 'multiple',
}