import { createContext, useState } from "react";

export enum AppTopBarBannerVariant {
  Success = "success",
  Dange = "danger",
  Warning = "warning",
}

type AppTopBarBannerContextBanner = {
  variant: AppTopBarBannerVariant;
  message: string;
  pages?: string[];
};

interface IAppTopBarBannerContext {
  banner?: AppTopBarBannerContextBanner;
  setBanner: (banner: AppTopBarBannerContextBanner) => void;
  isPageAllowed: () => boolean;
}

export const AppTopBarBannerContext = createContext({
  banner: undefined,
  setBanner: () => {},
  isPageAllowed: () => false,
} as IAppTopBarBannerContext);

interface AppTopBarBannerProviderProps {
  children: JSX.Element | Array<JSX.Element>;
}

export const AppTopBarBannerProvider = ({
  children,
}: AppTopBarBannerProviderProps) => {
  const [banner, setBanner] = useState<
    AppTopBarBannerContextBanner | undefined
  >(undefined);

  const isPageAllowed = () =>
    !!banner?.pages?.length &&
    !banner.pages.every((page) => !window.location.href.includes("/" + page));

  return (
    <AppTopBarBannerContext.Provider
      value={{ banner, setBanner, isPageAllowed }}
    >
      {children}
    </AppTopBarBannerContext.Provider>
  );
};
