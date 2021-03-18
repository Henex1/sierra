import prisma from "../lib/prisma";

async function main() {
  // This function is run when prisma migrate reset is run. It can be used to
  // populate the database with initial data, as required.
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
