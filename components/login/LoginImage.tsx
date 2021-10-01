import React, { useEffect } from "react";
// import { requireEnv } from "../../lib/env";

// const flickrApiKey = requireEnv("FLICKR_API_KEY");
const flickrApiKey = "95a4aec85e8c06c12c3ee9db64a27202";

// config for Flickr API requests
const config = {
  sort: "relevance",
  perPage: 500,
  page: 1,
  lang: "en-US",
  text: "sierra%20mountain%20snow",
  dimensionSearchMode: "min",
  orientation: "landscape",
  apiKey: flickrApiKey,
  format: "json",
  noJsonCallback: 1,
  contentType: 1,
  privacyFilter: 1,
};

const getViewportSize = () => {
  const node = document.querySelector(".image-container");
  return {
    height: node?.clientHeight || 0,
    width: node?.clientWidth || 0,
  };
};

const setImageSrc = (source: string) => {
  const node = document.querySelector(".image-container");
  node?.setAttribute("style", `background-image: url(${source})`);
};

const useDefaultImage = () => {
  setImageSrc("../images/sierra4k-login.jpeg");
};

const getPhotos = async () => {
  const {
    sort,
    perPage,
    page,
    lang,
    text,
    apiKey,
    dimensionSearchMode,
    orientation,
    format,
    noJsonCallback,
    contentType,
    privacyFilter,
  } = config;
  const { height, width } = getViewportSize();
  const query = `method=flickr.photos.search&sort=${sort}&per_page=${perPage}&page=${page}&lang=${lang}&text=${text}&dimension_search_mode=${dimensionSearchMode}&height=${height}&width=${width}&orientation=${orientation}&api_key=${apiKey}&format=${format}&nojsoncallback=${noJsonCallback}&content_type=${contentType}&privacy_filter=${privacyFilter}`;
  const result = await fetch(`https://api.flickr.com/services/rest?${query}`);
  const jsonRes = await result.json();

  return jsonRes;
};

const getPhotoById = async (id: string) => {
  const { apiKey, format, noJsonCallback, contentType, privacyFilter } = config;
  const query = `method=flickr.photos.getSizes&format=${format}&api_key=${apiKey}&photo_id=${id}&nojsoncallback=${noJsonCallback}&content_type=${contentType}&privacy_filter=${privacyFilter}`;
  const result = await fetch(`https://api.flickr.com/services/rest?${query}`);
  const jsonRes = await result.json();

  if (jsonRes.stat !== "ok") {
    // fail... use default image
    return useDefaultImage();
  }

  const sizes = jsonRes.sizes.size;
  const { height, width } = getViewportSize();
  const image = sizes.find((s: any) => s.height >= height && s.width >= width);

  return image ? setImageSrc(image.source) : useDefaultImage();
};

type LoginProps = {
  isSignin: boolean;
};

export default function LoginImage({ isSignin }: LoginProps) {
  useEffect(() => {
    if (window.location.pathname.indexOf("signin") > 1 || !isSignin) {
      getPhotos().then((rsp) => {
        if (rsp.stat === "ok") {
          const randIndex = Math.floor(Math.random() * (config.perPage + 1)); // random index from 0 to max items count on one page (see config.perPage)
          getPhotoById(rsp.photos.photo[randIndex].id);
        } else {
          // fail... use default image
          useDefaultImage();
        }
      });
    }
  }, []);

  return <div className="image-container"></div>;
}
