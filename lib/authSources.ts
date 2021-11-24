import { optionalEnv } from "./env";

export const AUTH_CONSTANTS = {
  googleId: optionalEnv("GOOGLE_ID").toString(),
  googleSecret: optionalEnv("GOOGLE_SECRET").toString(),
  githubId: optionalEnv("GITHUB_ID").toString(),
  githubSecret: optionalEnv("GITHUB_SECRET").toString(),
  atlassianId: optionalEnv("ATLASSIAN_ID").toString(),
  atlassianSecret: optionalEnv("ATLASSIAN_SECRET").toString(),
  azureAdId: optionalEnv("AZURE_AD_ID").toString(),
  azureAdSecret: optionalEnv("AZURE_AD_SECRET").toString(),
  azureAdTenantId: optionalEnv("AZURE_AD_TENANT_ID").toString(),
  gitlabId: optionalEnv("GITLAB_ID").toString(),
  gitlabSecret: optionalEnv("GITLAB_SECRET").toString(),
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
