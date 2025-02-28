export interface ShowNode {
  id: string;
  name: string;
  type: "show" | "person";
  val: number;
  networks?: string[];
  vx?: number; // force graph adds this
  vy?: number; // force graph adds this
  x?: number; // force graph adds this
  y?: number; // force graph adds this
  __indexColor?: string; // force graph adds this
}

export interface LinkNode {
  source: string;
  target: string;
  type: string;
}

export interface GraphData {
  nodes: ShowNode[];
  links: LinkNode[];
}

export interface Person {
  id: string;
  name: string;
  role: string;
}

export interface Show {
  id: string;
  title: string;
  year: number;
  rating: number;
  votes: number;
  people: Person[];
  networks: string[];
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
