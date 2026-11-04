const samples: Record<string, HTMLAudioElement> = {};
let enabled = $state(
	typeof localStorage !== 'undefined' ? localStorage.getItem('audio-enabled') !== 'false' : true
);

function playSample(file: string, volume = 0.35) {
	if (!enabled || typeof Audio === 'undefined') return;
	try {
		const sample = (samples[file] ??= new Audio(`/audio/${file}.ogg`));
		sample.volume = volume;
		sample.currentTime = 0;
		void sample.play().catch(() => {}); // Browser autoplay policy may reject non-user-initiated sound.
	} catch {
		// Audio not available
	}
}

export function playDeploy() {
	playSample('footstep04');
}

export function playAttack() {
	playSample('knifeSlice');
}

export function playConquer() {
// No suitable conquest sample in the supplied pack; intentionally silent.
}

export function playTurnStart() {
// No suitable turn notification sample in the supplied pack; intentionally silent.
}

export function playCardPlay() {
// No suitable card sample in the supplied pack; intentionally silent.
}

export function playVictory() {
// No suitable victory sample in the supplied pack; intentionally silent.
}

export function playDefeat() {
// No suitable defeat sample in the supplied pack; intentionally silent.
}

export const audio = {
	get enabled() {
		return enabled;
	},
	toggle() {
		enabled = !enabled;
		localStorage.setItem('audio-enabled', String(enabled));
	}
};
