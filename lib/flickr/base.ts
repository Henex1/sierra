import { Response } from "./types/Response";
import { ParsedUrlQueryInput, stringify } from "querystring";

const baseUrl = "https://api.flickr.com/services/rest";

// eslint-disable-next-line @typescript-eslint/ban-types
export const get = <T extends {}>(
  query: ParsedUrlQueryInput
): Promise<Response<T>> => {
  const _query = {
    ...query,
    format: "json",
    nojsoncallback: 1,
    content_type: 1,
    privacy_filter: 1,
  };
  return fetch(`${baseUrl}?${stringify(_query)}`).then((r) => {
    if (!r.ok) {
      throw r;
    }

    return r.json();
  });
};
