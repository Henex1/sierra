import { optionalEnv } from "./env";

export const AUTH_CONSTANTS = {
  googleId: optionalEnv("NEXT_PUBLIC_GOOGLE_ID").toString(),
  googleSecret: optionalEnv("NEXT_PUBLIC_GOOGLE_SECRET").toString(),
  githubId: optionalEnv("NEXT_PUBLIC_GITHUB_ID").toString(),
  githubSecret: optionalEnv("NEXT_PUBLIC_GITHUB_SECRET").toString(),
  atlassianId: optionalEnv("NEXT_PUBLIC_ATLASSIAN_ID").toString(),
  atlassianSecret: optionalEnv("NEXT_PUBLIC_ATLASSIAN_SECRET").toString(),
  azureAdId: optionalEnv("NEXT_PUBLIC_AZURE_AD_ID").toString(),
  azureAdSecret: optionalEnv("NEXT_PUBLIC_AZURE_AD_SECRET").toString(),
  azureAdTenantId: optionalEnv("NEXT_PUBLIC_AZURE_AD_TENANT_ID").toString(),
  gitlabId: optionalEnv("NEXT_PUBLIC_GITLAB_ID").toString(),
  gitlabSecret: optionalEnv("NEXT_PUBLIC_GITLAB_SECRET").toString(),
};

export const isAuthTypeEnabled = (type: string) => {
  switch (type) {
    case "google":
      return AUTH_CONSTANTS.googleId && AUTH_CONSTANTS.googleSecret;
    case "github":
      return AUTH_CONSTANTS.githubId && AUTH_CONSTANTS.githubSecret;
    case "atlassian":
      return AUTH_CONSTANTS.atlassianId && AUTH_CONSTANTS.atlassianSecret;
    case "azureAd":
      return (
        AUTH_CONSTANTS.azureAdId &&
        AUTH_CONSTANTS.azureAdSecret &&
        AUTH_CONSTANTS.azureAdTenantId
      );
    case "gitlab":
      return AUTH_CONSTANTS.gitlabId && AUTH_CONSTANTS.gitlabSecret;
    default:
      return false;
  }
};
