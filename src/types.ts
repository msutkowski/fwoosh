export interface Asset {
  path: string;
  folder: string;
}

export interface Layout {
  name: string;
  path: string;
}

export interface FrontMatter {
  layout?: string;
}
