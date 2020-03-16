import * as ffmpeg from '@ffmpeg-installer/ffmpeg';
import * as ffprobe from '@ffprobe-installer/ffprobe';
import * as VideoHash from 'video-hash';

const vHash = VideoHash({
    ffmpegPath: ffmpeg.path,
    ffprobePath: ffprobe.path
});

export class VideoHashWrapper {
    video: typeof vHash;

    constructor(path: string) {
        this.video = vHash.video(path);
    }

    async setHash(): Promise<void> {
        return await this.video.hash();
    }
}
