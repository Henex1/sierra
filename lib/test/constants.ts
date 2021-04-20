import { UserSiteRole } from "../prisma";

export const TEST_USER_ID = 1100;
export const TEST_ORG_ID = 1200;
export const TEST_PROJECT_ID = 1300;
export const TEST_SEARCHENDPOINT_ID = 1400;

export const TEST_PROJECT = {
  id: TEST_PROJECT_ID,
  orgId: TEST_ORG_ID,
  searchEndpointId: TEST_SEARCHENDPOINT_ID,
  name: "Test Project",
};

export const TEST_USER = {
  id: TEST_USER_ID,
  name: "Test User",
  email: "devs@bigdataboutique.com",
  emailVerified: new Date(2020, 1, 1),
  image: "https://placekitten.com/200/200",
  siteRole: "USER" as UserSiteRole,
};

export const TEST_ORG = {
  id: TEST_ORG_ID,
  name: "Test Org",
};

export const TEST_ORGUSER = {
  userId: TEST_USER_ID,
  orgId: TEST_ORG_ID,
  role: "ADMIN",
};

export const TEST_SEARCHENDPOINT = {
  id: TEST_SEARCHENDPOINT_ID,
  orgId: TEST_ORG_ID,
  name: "Local Elasticsearch",
  description: "Local elasticsearch instance",
  whitelist: [],
  type: "ELASTICSEARCH",
  info: { endpoint: "http://localhost:9200/icecat/_search" },
};
