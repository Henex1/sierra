import * as Zod from "zod";
import { getAsync, redisClient, setAsync } from "../../redis";
import { Image, ImageSchema } from "../types/Image";
import * as Redis from "../../redis";
import { NonEmptyArray } from "../../../utils/array";
import { onNull, onUndefined } from "../../../utils/error";

const IdsSchema = Zod.array(Zod.string().nonempty()).nonempty();
const DURATION = 60 * 60 * 24;

export const getIds = async (): Promise<NonEmptyArray<string>> => {
  return getAsync("login_images.ids")
    .then(onNull)
    .then(JSON.parse)
    .then(IdsSchema.parse);
};

export const setIds = async (ids: NonEmptyArray<string>): Promise<void> => {
  await setAsync("login_images.ids", JSON.stringify(ids));
  redisClient.expire("login_images.ids", DURATION);
};

const ImagesSchema = Zod.array(ImageSchema).nonempty();
export const getImages = async (): Promise<NonEmptyArray<Image>> => {
  return Redis.getAsync("login_images.images")
    .then(onNull)
    .then(JSON.parse)
    .then(ImagesSchema.parse);
};

export const getImage = (id: string): Promise<Image> => {
  return getImages()
    .then((is) => is.find((i) => i.id === id))
    .then(onUndefined);
};

export const setImage = async (image: Image): Promise<void> => {
  try {
    const images = await getImages().then((is) =>
      is.filter((i) => i.id !== image.id)
    );
    images.push(image);

    await setAsync("login_images.images", JSON.stringify(images));
  } catch {
    await setAsync("login_images.images", JSON.stringify([image]));
  }

  redisClient.expire("login_images.images", DURATION);
};

export const clearImages = async (): Promise<void> => {
  await setAsync("login_images.images", "");
};
