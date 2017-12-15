class AudioPlayer {
    constructor(context) {
        this.context = context;
    }

    bestAudioExtension() {
        const $audio = document.createElement('audio');

        // In order of preference
        const supportedFormats = [
            { type: 'audio/webm', ext: 'webm' },
            { type: 'audio/mpeg', ext: 'mp3' }
        ];

        const format = supportedFormats.find((format) => {
            const canPlay = $audio.canPlayType(format.type) !== '';

            if (canPlay) {
                return format;
            }
        });

        if (!format) {
            throw new Error('no supported file format');
        }

        return format.ext;
    }

    async getAudioData(audioURL, callback) {
        console.log(`getAudioData from ${audioURL}`);

        const req = new Request(audioURL);
        const res = await fetch(req);
        return await res.arrayBuffer();
    }

    // 0 to 1 with .1 increment steps
    setVolume(level) {
        console.log(`new volume is ${level}`);
        this.gainNode.gain.setValueAtTime(level, this.context.currentTime);
    }

    pause() {
        console.log('pause');
        this.context.suspend();
        this._isPlaying = false;
    }

    play() {
        if (!this.context) {
            console.log('trying to play, but no context');
            return;
        }
        console.log('play');
        this._isPlaying = true;
        this.context.resume();
    }

    isPlaying() {
        return this._isPlaying;
    }

    async init() {
        const context = this.context;
        const extension = this.bestAudioExtension();
        const audioURL = `/waterfall.${extension}`;

        const audioData = await this.getAudioData(audioURL);

        this.gainNode = context.createGain();

        return new Promise((resolve) => {
            context.decodeAudioData(audioData, (buffer) => {
                console.log('init finished decoding audio data');
                const context = this.context;
                const sourceNode = context.createBufferSource();
                sourceNode.loop = true;
                sourceNode.buffer = buffer;
                sourceNode.connect(this.gainNode);
                this.gainNode.connect(context.destination);
                this.context.suspend();
                sourceNode.start(0);
                resolve();
            });
        });
    }
}
