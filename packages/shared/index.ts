// server
export interface GraphNode {
	id: string;
	label: string;
	val: number;
	type: "show" | "movie" | "music-artist" | "person";
	groupLinks: number;
	year?: number;
	topText?: string[];
	vx?: number; // force graph adds this
	vy?: number; // force graph adds this
	x?: number; // force graph adds this
	y?: number; // force graph adds this
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
	simulation?: d3.Simulation<any, any>;
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

export type MediaType = "shows" | "movies"; // | "music-artists";
