import path from "path";
import { loadEnvConfig } from "@next/env";

import prisma from "../lib/prisma";

async function main() {
  loadEnvConfig(path.join(path.dirname(__filename), ".."));

  // This function is run when prisma migrate reset is run. It can be used to
  // populate the database with initial data, as required.
  await prisma.user.create({
    data: {
      id: 1,
      name: "Test User",
      email: "devs@bigdataboutique.com",
      emailVerified: new Date(2020, 1, 1),
      image: "https://placekitten.com/200/200",
      siteRole: "USER",
    },
  });
  await prisma.org.create({
    data: {
      id: 1,
      name: "Test Org",
      users: {
        create: {
          userId: 1,
          role: "ADMIN",
        },
      },
    },
  });
  await prisma.searchEndpoint.create({
    data: {
      id: 1,
      orgId: 1,
      name: "Local Elasticsearch",
      type: "ELASTICSEARCH",
      info: { endpoint: "http://localhost:9200/icecat/_search" },
    },
  });
  await prisma.project.create({
    data: {
      orgId: 1,
      searchEndpointId: 1,
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
