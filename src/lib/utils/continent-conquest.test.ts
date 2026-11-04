import { describe, expect, it } from 'vitest';
import { createContinentConquestDetector } from './continent-conquest';
import type { Continent, MapLayer } from '$lib/types/map';
import type { Region } from '$lib/types/game';

const continents: Continent[] = [{ id: 'north', name: 'Norte', bonus_troops: 2 }];
const layers: MapLayer[] = [
	{ id: 'a', name: 'A', continent: 'north', d: '' },
	{ id: 'b', name: 'B', continent: 'north', d: '' }
];
const partial: Region[] = [{ id: 'a', ownerId: 'p1', troops: 1 }, { id: 'b', ownerId: 'p2', troops: 1 }];
const conquered: Region[] = [{ id: 'a', ownerId: 'p1', troops: 1 }, { id: 'b', ownerId: 'p1', troops: 1 }];

describe('continent conquest detection', () => {
	it('uses the initial snapshot as baseline; emits once on ownership transition', () => {
		const detect = createContinentConquestDetector();
		expect(detect(conquered, layers, continents)).toBeNull();
		expect(detect(partial, layers, continents)).toBeNull();
		expect(detect(conquered, layers, continents)).toBe('Norte');
		expect(detect(conquered, layers, continents)).toBeNull();
	});

	it('resets baseline on disconnect so reconnect snapshot is not announced', () => {
		const detect = createContinentConquestDetector();
		detect(partial, layers, continents);
		expect(detect(conquered, layers, continents)).toBe('Norte');
		expect(detect([], [], [], false)).toBeNull();
		expect(detect(conquered, layers, continents)).toBeNull();
	});
});
