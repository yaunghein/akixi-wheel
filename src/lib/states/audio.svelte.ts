import { getContext, setContext } from 'svelte';

type TAudioKey = 'click' | 'background' | 'spin';
type TAudiosRaw = Partial<Record<TAudioKey, string>>;
type TAudios = Partial<Record<TAudioKey, HTMLAudioElement>>;

const FADE_DURATION = 3000;
const FADE_STEPS = 50;

class AudioState {
	_audios: TAudiosRaw = {};

	audios = $state<TAudios>({});
	volumns = $state({ background: 0.02, spin: 0.05, others: 0.25 });
	isBackgroundPlaying = $state(false);

	constructor(audios: TAudiosRaw) {
		this._audios = audios;

		$effect(() => {
			if (this.audios.background) {
				this.audios.background.volume = this.volumns.background;
			}
		});
	}

	load() {
		Object.entries(this._audios).forEach(([key, path]) => {
			this.audios[key as TAudioKey] = new Audio(path);
		});
	}

	play(key: TAudioKey) {
		const audio = this.audios[key];
		if (!audio) return;

		if (key === 'spin') audio.volume = this.volumns.spin;
		if (key !== 'background' && key !== 'spin') audio.volume = this.volumns.others;

		audio.currentTime = 0;
		audio.play();
	}

	toggleBackground() {
		this.isBackgroundPlaying ? this.stopBackground() : this.playBackground();
	}

	playBackground() {
		const background = this.audios.background;
		if (!background) return;

		background.loop = false;
		background.volume = 0;
		background.currentTime = 0;
		background.play();
		this.isBackgroundPlaying = true;

		this.fadeVolume('background', 0, this.volumns.background);

		const onTimeUpdate = () => {
			if (
				background &&
				background.duration &&
				background.currentTime > background.duration - FADE_DURATION / 1000 - 0.1
			) {
				background.removeEventListener('timeupdate', onTimeUpdate);
				this.fadeVolume('background', background.volume, 0);
			}
		};

		background.addEventListener('timeupdate', onTimeUpdate);

		background.onended = () => {
			if (this.isBackgroundPlaying) {
				background.currentTime = 0;
				background.volume = 0;
				background.play();
				this.fadeVolume('background', 0, this.volumns.background);
				background.addEventListener('timeupdate', onTimeUpdate);
			}
		};
	}

	stopBackground() {
		const background = this.audios.background;
		if (!background) return;

		this.fadeVolume('background', background.volume, 0);

		setTimeout(() => {
			if (background && !this.isBackgroundPlaying) {
				background.pause();
				background.currentTime = 0;
				background.volume = 0;
			}
		}, FADE_DURATION);

		this.isBackgroundPlaying = false;
	}

	fadeVolume(key: TAudioKey, from: number, to: number) {
		const audio = this.audios[key];
		if (!audio) return;

		from = Math.max(0, Math.min(1, from));
		to = Math.max(0, Math.min(1, to));

		if (from === to) {
			audio.volume = to;
			return;
		}

		const stepTime = FADE_DURATION / FADE_STEPS;
		const volumeStep = (to - from) / FADE_STEPS;
		let currentStep = 0;

		audio.volume = from;

		const interval = setInterval(() => {
			currentStep++;
			const newVolume = from + volumeStep * currentStep;
			audio.volume = Math.max(0, Math.min(1, newVolume));

			if (currentStep >= FADE_STEPS) {
				audio.volume = to;
				clearInterval(interval);
			}
		}, stepTime);
	}
}

const AUDIO_KEY = Symbol('WHEEL_AUDIO');

export const setAudioState = (audios: Record<string, string>) => {
	return setContext(AUDIO_KEY, new AudioState(audios));
};

export const getAudioState = () => {
	return getContext<ReturnType<typeof setAudioState>>(AUDIO_KEY);
};
