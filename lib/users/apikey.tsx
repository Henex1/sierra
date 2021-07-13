import _ from "lodash";
import DateFnsAdapter from "@date-io/date-fns";
import prisma, { User, ApiKey } from "../prisma";
import { generateUniqueId } from "../common";

export const APIKEY_EXPIRATION_PERIOD = 20;

const dateFns = new DateFnsAdapter();

// This is the list of keys which are included in user requests for ApiKey
// by default.
const selectKeys = {
  apikey: true,
  alias: true,
};

export type ExposedApiKey = Pick<ApiKey, keyof typeof selectKeys> & {
  expirationDate: string;
};

export function isExpired(val: ApiKey): boolean {
  const expirationDateTime = dateFns.addDays(
    dateFns.date(val.createdAt),
    APIKEY_EXPIRATION_PERIOD
  );
  return dateFns.isAfter(dateFns.date(), expirationDateTime);
}

export function formatApiKey(val: ApiKey): ExposedApiKey {
  const result = _.pick(val, _.keys(selectKeys)) as ExposedApiKey;
  const expirationDateTime = dateFns.addDays(
    dateFns.date(val.createdAt),
    APIKEY_EXPIRATION_PERIOD
  );
  result.expirationDate = dateFns.format(
    expirationDateTime,
    "dd MMM yyyy HH:mm"
  );
  return result;
}

export async function listApiKeys(user: User): Promise<ApiKey[]> {
  const apikeys = await prisma.apiKey.findMany({
    where: {
      userId: user.id,
    },
  });
  return apikeys;
}

export async function createApiKey(user: User, alias: string): Promise<void> {
  await prisma.apiKey.create({
    data: {
      apikey: generateUniqueId(),
      alias: alias,
      userId: user.id,
    },
  });
}

export async function deleteApiKey(user: User, apiKey: string): Promise<void> {
  await prisma.apiKey.deleteMany({
    where: { apikey: apiKey, userId: user.id },
  });
}
