import * as Photos from "../../flickr/photos";
import * as Photo from "../../flickr/photo";
import { Image } from "../types/Image";

export const getIds = (apiKey: string): Promise<string[]> => {
  return Photos.getPhotos({
    sort: "relevance",
    per_page: 500,
    page: 1,
    lang: "en-US",
    text: "sierra mountain snow",
    dimension_search_mode: "min",
    orientation: "landscape",
    api_key: apiKey,
    width: 1920,
    height: 1080,
  })
    .then((r) => {
      switch (r.stat) {
        case "fail": {
          throw r;
        }
        case "ok":
          return r.photos;
      }
    })
    .then((r) => r.photo.map(({ id }) => id));
};

export const getSizes = async (apiKey: string, id: string): Promise<Image> => {
  return Photo.getPhoto({
    api_key: apiKey,
    photo_id: id,
  }).then((r) => {
    switch (r.stat) {
      case "fail": {
        throw r;
      }
      case "ok":
        return {
          id,
          sizes: r.sizes.size.map((s) => ({
            src: s.source,
            width: s.width,
            height: s.height,
          })),
        };
    }
  });
};
