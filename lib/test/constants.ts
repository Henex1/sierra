import {
  UserSiteRole,
  Project,
  User,
  Org,
  OrgUser,
  SearchEndpoint,
  Judgement,
} from "../prisma";

// If this ever causes problems, remove it and actually build some fake
// timestamps.
type NoTimestamps<T> = Omit<T, "createdAt" | "updatedAt">;

export const TEST_USER_ID = 1100;
export const TEST_ORG_ID = 1200;
export const TEST_PROJECT_ID = 1300;
export const TEST_SEARCHENDPOINT_ID = 1400;
export const TEST_JUDGEMENT_ID = 1400;

export const TEST_PROJECT: NoTimestamps<Project> = {
  id: TEST_PROJECT_ID,
  orgId: TEST_ORG_ID,
  searchEndpointId: TEST_SEARCHENDPOINT_ID,
  name: "Test Project",
};

export const TEST_USER: NoTimestamps<User> = {
  id: TEST_USER_ID,
  name: "Test User",
  email: "devs@bigdataboutique.com",
  emailVerified: new Date(2020, 1, 1),
  image: "https://placekitten.com/200/200",
  siteRole: "USER" as UserSiteRole,
  activeOrgId: TEST_ORG_ID,
};

export const TEST_ORG: NoTimestamps<Org> = {
  id: TEST_ORG_ID,
  name: "Test Org",
  image: "https://placekitten.com/200/200",
};

export const TEST_ORGUSER: NoTimestamps<OrgUser> = {
  id: 11001200,
  userId: TEST_USER_ID,
  orgId: TEST_ORG_ID,
  role: "ADMIN",
};

export const TEST_SEARCHENDPOINT: NoTimestamps<SearchEndpoint> = {
  id: TEST_SEARCHENDPOINT_ID,
  orgId: TEST_ORG_ID,
  name: "Local Elasticsearch",
  description: "Local elasticsearch instance",
  resultId: "_id",
  whitelist: [],
  displayFields: [],
  type: "ELASTICSEARCH",
  info: { endpoint: "http://localhost:9200/icecat/_search" },
};

export const TEST_JUDGEMENT: NoTimestamps<Judgement> = {
  id: TEST_JUDGEMENT_ID,
  name: "Test Judgement",
  projectId: TEST_PROJECT_ID,
};
