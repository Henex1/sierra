module.exports = {
  configs: {
    recommended: {
      rules: {
        "sierra/unsafe-raw-sql": "error",
        "sierra/process-env": "error",
      },
    },
  },
  rules: {
    "unsafe-raw-sql": {
      meta: {
        type: "problem",
        docs: {
          description: "Improperly escaped SQL query",
          category: "Security",
          recommended: true,
        },
        messages: {
          unsafeSql: "Unsafe usage of {{name}}",
        },
      },
      create: function (context) {
        return {
          "CallExpression[callee.property.name='$executeRaw']": function (
            node
          ) {
            context.report({
              node,
              messageId: "unsafeSql",
              data: { name: "$executeRaw" },
            });
          },
          "CallExpression[callee.property.name='$queryRaw']": function (node) {
            context.report({
              node,
              messageId: "unsafeSql",
              data: { name: "$queryRaw" },
            });
          },
        };
      },
    },
    "process-env": {
      meta: {
        type: "problem",
        docs: {
          description:
            "Do not directly use process.env, use requireEnv or optionalEnv from lib/env instead.",
          category: "Best Practices",
          recommended: true,
        },
        messages: {
          processEnv:
            "Do not use process.env, use a helper from lib/env instead",
        },
      },
      create: function (context) {
        return {
          "MemberExpression:matches([property.name!='NODE_ENV']) > MemberExpression[object.name='process'][property.name='env']": function (
            node
          ) {
            context.report({
              node,
              messageId: "processEnv",
            });
          },
        };
      },
    },
  },
};
