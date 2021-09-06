import {
  UserSiteRole,
  Project,
  User,
  Org,
  OrgUser,
  SearchEndpoint,
  Judgement,
  SearchConfiguration,
  JudgementSearchConfiguration,
  Execution,
  QueryTemplate,
  Ruleset,
} from "../prisma";

// If this ever causes problems, remove it and actually build some fake
// timestamps.
type NoTimestamps<T> = Omit<T, "createdAt" | "updatedAt">;

export const TEST_USER_ID = "c111111110000user00000000";
export const TEST_ORG_ID = "c111111110000orga00000000";
export const TEST_PROJECT_ID = "c111111110000proj00000000";
export const TEST_SEARCHENDPOINT_ID = "c111111110000dsrc00000000";
export const TEST_JUDGEMENT_ID = "c111111110000judg00000000";
export const TEST_SEARCHCONFIGURATION_JUDGEMENT_ID = 1;
export const TEST_RULESET_ID = "c111111110000rset00000000";
export const TEST_SEARCHCONFIGURATION_ID = "c111111110000scfg00000000";
export const TEST_EXECUTION_ID = "c111111110000exec00000000";
export const TEST_QUERYTEMPLATE_ID = "c111111110000tmpl00000000";

export const TEST_PROJECT: NoTimestamps<Project> = {
  id: TEST_PROJECT_ID,
  orgId: TEST_ORG_ID,
  searchEndpointId: TEST_SEARCHENDPOINT_ID,
  activeSearchConfigurationId: TEST_SEARCHCONFIGURATION_ID,
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
  info: { endpoint: "http://localhost:9200", index: "icecat" },
  credentials: null,
};

export const TEST_JUDGEMENT: NoTimestamps<Judgement> = {
  id: TEST_JUDGEMENT_ID,
  name: "Test Judgement",
  projectId: TEST_PROJECT_ID,
};

export const TEST_SEARCHCONFIGURATION_JUDGEMENT: NoTimestamps<JudgementSearchConfiguration> = {
  id: TEST_SEARCHCONFIGURATION_JUDGEMENT_ID,
  judgementId: TEST_JUDGEMENT_ID,
  searchConfigurationId: TEST_SEARCHCONFIGURATION_ID,
  weight: 1,
};

export const TEST_SEARCHCONFIGURATION: NoTimestamps<SearchConfiguration> = {
  id: TEST_SEARCHCONFIGURATION_ID,
  queryTemplateId: TEST_QUERYTEMPLATE_ID,
};

export const TEST_EXECUTION: NoTimestamps<Execution> = {
  id: TEST_EXECUTION_ID,
  projectId: TEST_PROJECT_ID,
  searchConfigurationId: TEST_SEARCHCONFIGURATION_ID,
  meta: {},
  combinedScore: 0.5,
  allScores: {},
};

export const TEST_QUERYTEMPLATE: NoTimestamps<QueryTemplate> = {
  id: TEST_QUERYTEMPLATE_ID,
  projectId: TEST_PROJECT_ID,
  parentId: "TEST_PARENT_QT_123123123123",
  query: "test query",
  knobs: {},
  description: "test description",
};

export const TEST_RULESET: NoTimestamps<Ruleset> = {
  id: TEST_RULESET_ID,
  projectId: TEST_PROJECT_ID,
  name: "Test Ruleset",
};
