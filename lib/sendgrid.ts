import Sendgrid from "@sendgrid/mail";
import { optionalEnv } from "./env";

const getSendGridClient = (): Sendgrid.MailService | undefined => {
  const key = optionalEnv("SENDGRID_API_KEY");
  if (!key) {
    return undefined;
  }

  Sendgrid.setApiKey(key.toString());

  return Sendgrid;
};

export const sendGridClient = getSendGridClient();
