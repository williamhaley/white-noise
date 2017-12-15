/*

Safari is weird. Audio will not play unless we have human interaction. It seems
that, to require only one click, we should initialize the audio context up
front. Then create the audio node and start the stream. Finally, use the human
interaction to toggle suspend/resume on the context. It seems that the resume()
call is the line between Safari allowing/needing human intervention.

https://stackoverflow.com/questions/46249361/cant-get-web-audio-api-to-work-with-ios-11-safari

*/

const $button = document.querySelector('button');
const $volume = document.querySelector('input[type="range"]');

const context = new (window.AudioContext || window.webkitAudioContext)();
const audioPlayer = new AudioPlayer(context);

(async () => {
    await audioPlayer.init();
    $button.disabled = false;

    $button.addEventListener('click', () => {
        if (audioPlayer.isPlaying()) {
            audioPlayer.pause();
            $button.textContent = 'Play';
        } else {
            audioPlayer.play();
            $button.textContent = 'Pause';
        }
    });

    $volume.addEventListener('change', (event) => {
        const volume = event.target.value;

        if (volume == 10) {
            audioPlayer.setVolume(1);
        } else {
            audioPlayer.setVolume(`0.${volume}`);
        }
    });
})();

