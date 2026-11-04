import { describe, it, expect } from 'vitest';
import { formatRegionName, formatContinentName } from './format';

describe('formatRegionName', () => {
	it('localizes named game regions and leaves unknown IDs readable', () => {
		expect(formatRegionName('north_america')).toBe('north america');
		expect(formatRegionName('eastern_australia')).toBe('Austrália Oriental');
	});

	it('handles multiple underscores', () => {
		expect(formatRegionName('new_south_wales')).toBe('new south wales');
	});

	it('localizes named regions without underscores', () => {
		expect(formatRegionName('alaska')).toBe('Alasca');
	});

	it('handles empty string', () => {
		expect(formatRegionName('')).toBe('');
	});
});

describe('formatContinentName', () => {
	it('localizes continent labels and accepts IDs or display names', () => {
		expect(formatContinentName('north_america')).toBe('América do Norte');
		expect(formatContinentName('Oceania')).toBe('Oceania');
	});
});
