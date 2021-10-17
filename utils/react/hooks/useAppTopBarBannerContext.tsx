import { useContext } from "react";
import { AppTopBarBannerContext } from "../providers/AppTopBarBannerProvider";

export const useAppTopBarBannerContext = () => {
  const context = useContext(AppTopBarBannerContext);

  if (!context) {
    throw new Error(
      "Application should be wrapped in a AppTopBarBannerProvider"
    );
  }

  return context;
};
