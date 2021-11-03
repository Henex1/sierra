import { get } from "./base";

export interface Config {
  api_key: string;
  photo_id: string;
}

export interface Size {
  label: string;
  width: number;
  height: number;
  source: string;
  url: string;
  media: string;
}

interface Photo {
  sizes: {
    canblog: number;
    canprint: number;
    candownload: number;
    size: Size[];
  };
}

export const getPhoto = (config: Config) => {
  const params = {
    ...config,
    method: "flickr.photos.getSizes",
  };

  return get<Photo>(params);
};
