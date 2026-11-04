/**
 * Display formatting helpers for game entities.
 */

const regionNames: Record<string, string> = {
	eastern_australia: 'Austrália Oriental', indonesia: 'Indonésia', new_guinea: 'Nova Guiné',
	alaska: 'Alasca', ontario: 'Ontário', northwest_territory: 'Território do Noroeste',
	venezuela: 'Venezuela', madagascar: 'Madagascar', north_africa: 'Norte da África',
	greenland: 'Groenlândia', iceland: 'Islândia', great_britain: 'Grã-Bretanha',
	scandinavia: 'Escandinávia', japan: 'Japão', yakutsk: 'Yakutsk', kamchatka: 'Kamtchatka',
	siberia: 'Sibéria', ural: 'Ural', afghanistan: 'Afeganistão', middle_east: 'Oriente Médio',
	india: 'Índia', siam: 'Sião', china: 'China', mongolia: 'Mongólia', irkutsk: 'Irkutsk',
	ukraine: 'Ucrânia', southern_europe: 'Europa Meridional', western_europe: 'Europa Ocidental',
	northern_europe: 'Europa Setentrional', egypt: 'Egito', east_africa: 'África Oriental',
	congo: 'Congo', south_africa: 'África do Sul', brazil: 'Brasil', argentina: 'Argentina',
	eastern_united_states: 'Estados Unidos Oriental', western_united_states: 'Estados Unidos Ocidental',
	quebec: 'Quebec', central_america: 'América Central', peru: 'Peru',
	western_australia: 'Austrália Ocidental', alberta: 'Alberta'
};

const continentNames: Record<string, string> = {
	oceania: 'Oceania', asia: 'Ásia', europe: 'Europa', north_america: 'América do Norte',
	south_america: 'América do Sul', africa: 'África'
};

/** Localize known game-map names while keeping unknown IDs readable. */
export const formatRegionName = (id: string): string =>
	regionNames[id.toLowerCase()] ?? id.replace(/_/g, ' ');

export const formatContinentName = (name: string): string =>
	continentNames[name.toLowerCase().replace(/\s+/g, '_')] ?? name;
