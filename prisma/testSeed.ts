import path from "path";
import { loadEnvConfig } from "@next/env";

import prisma from "../lib/prisma";

import {
  TEST_USER_ID,
  TEST_ORG_ID,
  TEST_PROJECT_ID,
  TEST_SEARCHENDPOINT_ID,
} from "../lib/test/constants";

async function main() {
  loadEnvConfig(path.join(path.dirname(__filename), ".."));

  // This function is run when prisma migrate reset is run. It can be used to
  // populate the database with initial data, as required.
  await prisma.user.create({
    data: {
      id: TEST_USER_ID,
      name: "Test User",
      email: "devs@bigdataboutique.com",
      emailVerified: new Date(2020, 1, 1),
      image: "https://placekitten.com/200/200",
      siteRole: "USER",
    },
  });
  await prisma.org.create({
    data: {
      id: TEST_ORG_ID,
      name: "Test Org",
      users: {
        create: {
          userId: TEST_USER_ID,
          role: "ADMIN",
        },
      },
    },
  });
  await prisma.searchEndpoint.create({
    data: {
      id: TEST_SEARCHENDPOINT_ID,
      orgId: TEST_ORG_ID,
      name: "Local Elasticsearch",
      description: "Local elasticsearch instance",
      whitelist: [],
      type: "ELASTICSEARCH",
      info: { endpoint: "http://localhost:9200/icecat/_search" },
    },
  });
  await prisma.searchEndpoint.create({
    data: {
      id: TEST_SEARCHENDPOINT_ID + 1,
      orgId: TEST_ORG_ID,
      name: "Remote Elasticsearch",
      description: "A different elasticsearch instance",
      whitelist: [],
      type: "ELASTICSEARCH",
      info: { endpoint: "http://es.local:9200/icecat/_search" },
    },
  });
  await prisma.project.create({
    data: {
      id: TEST_PROJECT_ID,
      orgId: TEST_ORG_ID,
      searchEndpointId: TEST_SEARCHENDPOINT_ID,
      name: "Test Project",
    },
  });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
