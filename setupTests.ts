import path from "path";
import { loadEnvConfig } from "@next/env";
import { IncomingMessage } from "http";

import prisma from "./lib/prisma";
import { UserSession } from "./lib/authServer";

import "@testing-library/jest-dom/extend-expect";

loadEnvConfig(path.dirname(__filename), true, {
  info(...args: any[]): void {
    // Silence info statements while loading environment variables
  },
  error(...args: any[]): void {
    console.error(...args);
  },
});

afterAll(async (done) => {
  await prisma.$disconnect();
  done();
});

jest.mock("./components/Session", () => {
  return {
    ...jest.requireActual("./components/Session"),
    SessionProvider: ({ children }: any) => children,
    useSession: () => ({ session: { loading: true }, refresh: async () => {} }),
  };
});

let mockUserId: number | undefined = 1;
const mockGetUser = jest.fn(async () => {
  if (mockUserId === undefined) {
    return {};
  }
  const user =
    (await prisma.user.findUnique({
      where: { id: mockUserId },
    })) ?? undefined;
  return { session: {}, user };
});

afterEach(() => {
  mockUserId = 1;
});

jest.mock("./lib/authServer", () => {
  return { getUser: mockGetUser };
});
