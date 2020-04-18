import axios from 'axios';
import {createWriteStream} from 'fs';
import * as ffmpeg from '@ffmpeg-installer/ffmpeg';
import * as ffprobe from '@ffprobe-installer/ffprobe';
import * as VideoHash from 'video-hash';

const vHash = VideoHash({
    ffmpegPath: ffmpeg.path,
    ffprobePath: ffprobe.path
});

export class Video {
    video: typeof vHash;

    constructor(path: string) {
        this.video = vHash.video(path);
    }

    async setHash(): Promise<void> {
        return await this.video.hash();
    }

    static async downloadVideo(url: string, writeTo): Promise<void> {
        try {
            const data = await (await axios({url, responseType: 'stream'})).data;

            return new Promise((resolve, reject) => {
                data.pipe(createWriteStream(writeTo))
                    .on('finish', () => {
                        resolve();
                    })
                    .on('error', (e) => {
                        reject(e);
                    })
            })
        } catch(e) {
            throw e;
        }
    }
}
