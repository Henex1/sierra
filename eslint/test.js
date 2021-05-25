/* eslint-disable @typescript-eslint/no-var-requires */
const { RuleTester } = require("eslint");

const { rules } = require("./index");

var ruleTester = new RuleTester({
  parser: require.resolve("@typescript-eslint/parser"),
});
ruleTester.run("unsafe-raw-sql", rules["unsafe-raw-sql"], {
  valid: [
    "prisma.$executeRaw`SELECT ${foo}`",
    "prisma.$queryRaw`SELECT ${foo}`",
  ],
  invalid: [
    {
      code: 'prisma.$executeRaw("SELECT " + foo)',
      errors: [{ messageId: "unsafeSql" }],
    },
    {
      code: "prisma.$executeRaw(`SELECT ${foo}`)",
      errors: [{ messageId: "unsafeSql" }],
    },
    {
      code: 'prisma.$queryRaw("SELECT " + foo)',
      errors: [{ messageId: "unsafeSql" }],
    },
    {
      code: "prisma.$queryRaw(`SELECT ${foo}`)",
      errors: [{ messageId: "unsafeSql" }],
    },
  ],
});
ruleTester.run("process-env", rules["process-env"], {
  valid: ["process.env.NODE_ENV === 'development'"],
  invalid: [
    {
      code: "process.env.SECRET",
      errors: [{ messageId: "processEnv" }],
    },
  ],
});
