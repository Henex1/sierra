import Sendgrid from "@sendgrid/mail";
import { requireEnv } from "./env";

const getSendGridClient = (): Sendgrid.MailService | undefined => {
  const key = requireEnv("SENDGRID_API_KEY");
  if (!key) {
    return undefined;
  }

  Sendgrid.setApiKey(key);

  return Sendgrid;
};

export const sendGridClient = getSendGridClient();
