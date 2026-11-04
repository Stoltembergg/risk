import type { Continent, MapLayer } from '$lib/types/map';
import type { Region } from '$lib/types/game';

export function createContinentConquestDetector() {
	let previous: Map<string, string | null> | null = null;

	return (regions: Region[], layers: MapLayer[], continents: Continent[], connected = true) => {
		if (!connected) {
			previous = null;
			return null;
		}
		const byId = new Map(regions.map((region) => [region.id, region]));
		const owners = new Map(continents.map((continent) => {
			const continentLayers = layers.filter((layer) => layer.continent === continent.id);
			const regionList = continentLayers.map((layer) => byId.get(layer.id));
			const owner = regionList.length && regionList.every((region) => region?.ownerId && region.ownerId === regionList[0]?.ownerId)
				? regionList[0]!.ownerId : null;
			return [continent.id, owner] as const;
		}));
		const conquered = previous && continents.find((continent) => {
			const owner = owners.get(continent.id);
			return owner && previous!.get(continent.id) !== owner;
		});
		previous = owners;
		return conquered?.name ?? null;
	};
}
