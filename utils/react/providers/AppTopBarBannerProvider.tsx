import { createContext, useState } from "react";

export enum AppTopBarBannerVariant {
  Success = "success",
  Dange = "danger",
  Warning = "warning",
}

type AppTopBarBannerContextBanner = {
  variant: AppTopBarBannerVariant;
  message: string;
};

interface IAppTopBarBannerContext {
  banner?: AppTopBarBannerContextBanner;
  setBanner: (banner: AppTopBarBannerContextBanner) => void;
}

export const AppTopBarBannerContext = createContext({
  banner: undefined,
  setBanner: () => {},
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

  return (
    <AppTopBarBannerContext.Provider value={{ banner, setBanner }}>
      {children}
    </AppTopBarBannerContext.Provider>
  );
};
