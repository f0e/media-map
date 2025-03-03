export interface GraphNode {
	id: string;
	label: string;
	val: number;
	type: "show" | "movie" | "music-artist" | "person";
	groupLinks: number;
	year?: number;
	topText?: string[];
	x?: number;
	y?: number;
}

export interface Link {
	source: string;
	target: string;
	type: string;
	value?: number;
}

export interface GraphData {
	nodes: GraphNode[];
	links: Link[];
}

export interface Person {
	id: string;
	name: string;
	type: string;
}

export interface Show {
	id: string;
	title: string;
	year: number;
	rating: number;
	votes: number;
	networks: string[];
	type: string;
}

export interface Movie {
	id: string;
	title: string;
	year: number;
	rating: number;
	votes: number;
	people: Person[];
	production_companies: string[];
}

export interface Artist {
	id: string;
	name: string;
	born: string;
	collaborators: Artist[];
}
