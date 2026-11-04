import { vi } from 'vitest';

// Stub globalThis.AudioContext for audio tests
const mockOscillator = {
	type: 'sine',
	frequency: { setValueAtTime: vi.fn() },
	connect: vi.fn(),
	start: vi.fn(),
	stop: vi.fn()
};

const mockGainNode = {
	gain: { setValueAtTime: vi.fn(), exponentialRampToValueAtTime: vi.fn() },
	connect: vi.fn()
};

globalThis.AudioContext = vi.fn().mockImplementation(() => ({
	currentTime: 0,
	destination: {},
	createOscillator: vi.fn().mockReturnValue(mockOscillator),
	createGain: vi.fn().mockReturnValue(mockGainNode)
})) as unknown as typeof AudioContext;
