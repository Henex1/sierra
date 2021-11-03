import { requireEnv } from "../env";
import * as Redis from "./internal/redis";
import * as Api from "./internal/api";
import { isNotEmpty, NonEmptyArray, randItem } from "../../utils/array";
import { Image } from "./types/Image";
import { memo } from "../../utils/async";

export const defaultImage = "../images/sierra4k-login.jpeg";
const flickrApiKey = requireEnv("FLICKR_API_KEY");

const getOrUpdate = memo(
  async (): Promise<NonEmptyArray<string>> => {
    try {
      return await Redis.getIds();
    } catch {
      Api.getIds(flickrApiKey).then((ids) => {
        if (isNotEmpty(ids)) {
          Redis.setIds(ids);
          // Clear cached images after the ids were updated
          Redis.clearImages();
        }

        throw new Error();
      });
      throw new Error();
    }
  },
  () => true
);

const getImageOrUpdate = memo(
  async (id: string): Promise<Image> => {
    try {
      return await Redis.getImage(id);
    } catch {
      Api.getSizes(flickrApiKey, id).then(Redis.setImage);

      throw new Error();
    }
  },
  (a, b) => a === b
);

export const randomImage = async (): Promise<Image["sizes"]> => {
  try {
    const id = await getOrUpdate().then(randItem);

    try {
      return await getImageOrUpdate(id).then((i) => i.sizes);
    } catch {
      return await Redis.getImages()
        .then(randItem)
        .then((i) => i.sizes);
    }
  } catch {
    return [
      {
        src: defaultImage,
        width: 9999999,
        height: 999999,
      },
    ];
  }
};
