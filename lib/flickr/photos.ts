import { get } from "./base";
import { Image } from "./types/Image";

export type Sort =
  | "date-posted-asc"
  | "date-posted-desc"
  | "date-taken-asc"
  | "date-taken-desc"
  | "interestingness-desc"
  | "interestingness-asc"
  | "relevance";

export interface Config {
  api_key: string;
  sort?: Sort;
  per_page?: number;
  page?: number;
  lang?: string;
  text?: string;
  dimension_search_mode?: "min" | "max";
  width?: number;
  height?: number;
  orientation?: "landscape" | "portrait" | "square";
}

export interface Photos {
  photos: {
    page: number;
    pages: number;
    perpage: number;
    total: number;
    photo: Image[];
  };
}

export const getPhotos = (config: Config) => {
  const params = {
    ...config,
    method: "flickr.photos.search",
  };

  return get<Photos>(params);
};
