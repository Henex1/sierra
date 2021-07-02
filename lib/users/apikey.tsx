import _ from "lodash";
import prisma, { User, ApiKey } from "../prisma";
import { generateUniqueId } from "../common";

// This is the list of keys which are included in user requests for ApiKey
// by default.
const selectKeys = {
  apikey: true,
};

export type ExposedApiKey = Pick<ApiKey, keyof typeof selectKeys>;

export function formatApiKey(val: ApiKey): ExposedApiKey {
  return _.pick(val, _.keys(selectKeys)) as ExposedApiKey;
}

export async function listApiKeys(user: User): Promise<ApiKey[]> {
  const apikeys = await prisma.apiKey.findMany({
    where: {
      userId: user.id,
    },
  });
  return apikeys;
}

export async function createApiKey(user: User): Promise<void> {
  await prisma.apiKey.create({
    data: {
      apikey: generateUniqueId(),
      userId: user.id,
    },
  });
}

export async function deleteApiKey(user: User, apiKey: string): Promise<void> {
  await prisma.apiKey.deleteMany({
    where: { apikey: apiKey, userId: user.id },
  });
}
