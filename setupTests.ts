import path from "path";
import { loadEnvConfig } from "@next/env";

import { User } from "./lib/prisma";
import {
  TEST_ORG as mockOrg,
  TEST_PROJECT as mockProject,
  TEST_USER,
} from "./lib/test";
import * as log from "./lib/logging";

import "@testing-library/jest-dom/extend-expect";

// This explicit mock call necessary so that next-page-tester doesn't try to
// "isolate" these modules between the client and the server. If it did
// that, none of the mocked implementations would be available to the code
// under test.
jest.mock("./lib/prisma", () => jest.requireActual("./lib/__mocks__/prisma"));
jest.mock("./lib/env", () => jest.requireActual("./lib/__mocks__/env"));

loadEnvConfig(path.dirname(__filename), true, {
  info(): void {
    // Silence info statements while loading environment variables
  },
  error(...args: any[]): void {
    log.error(args.join(", "));
  },
});

jest.mock("redis", () => jest.requireActual("redis-mock"));

jest.mock("./components/Session", () => {
  return {
    SessionProvider: ({ children }: any) => children,
    useSession: () => ({
      session: { loading: false, user: mockUser },
      refresh: async () => {},
    }),
    useActiveOrg: () => ({ activeOrg: mockOrg, setActiveOrg: async () => {} }),
    ActiveProjectProvider: ({ children }: any) => children,
    useActiveProject: () => ({ project: mockProject, setProject: () => {} }),
  };
});

const mockUser: User = {
  ...TEST_USER,
  createdAt: new Date(),
  updatedAt: new Date(),
  defaultOrgId: mockOrg.id,
};
const mockGetUser = jest.fn(async () => {
  return { session: {}, user: mockUser };
});

jest.mock("./lib/authServer", () => {
  return { getUser: mockGetUser };
});

jest.mock("next-auth/client", () => {
  return {
    Provider: ({ children }: any) => children,
    useSession: () => [
      { user: mockUser, orgs: [mockOrg], projects: [mockProject] },
      false,
    ],
  };
});
