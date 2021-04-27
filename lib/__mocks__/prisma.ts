import { PrismaClient, Prisma } from "@prisma/client";
const { PrismaClient: RealPrismaClient } = jest.requireActual("@prisma/client");

export interface MockPrismaWrapper {
  readonly client: MockPrismaClient;
  readonly dmmf: typeof Prisma.dmmf;
  model<Model extends keyof ModelDelegates>(
    model: Model
  ): MockModelWrapper<Model>;
}

export type ModelDelegates = Omit<PrismaClient, `$${string}`>;
export type ClientFns = Omit<PrismaClient, keyof ModelDelegates>;
export type MockClientFns = {
  [K in keyof ClientFns]: jest.Mocked<ClientFns[K]>;
};
export type MockPrismaClient = jest.Mocked<PrismaClient> & MockClientFns;

export interface MockModelWrapper<Model extends keyof ModelDelegates> {
  action<Action extends keyof ModelDelegates[Model]>(
    action: Action
  ): {
    with(
      args: Parameters<
        Extract<ModelDelegates[Model][Action], (...args: any[]) => any>
      >[0]
    ): {
      hasImplementation(
        implementation: (
          args: Parameters<
            Extract<ModelDelegates[Model][Action], (...args: any[]) => any>
          >[0]
        ) => ReturnType<
          Extract<ModelDelegates[Model][Action], (...args: any[]) => any>
        > extends Promise<infer T>
          ? T
          : never
      ): void;
      resolvesTo(
        result: ReturnType<
          Extract<ModelDelegates[Model][Action], (...args: any[]) => any>
        > extends Promise<infer T>
          ? T
          : never
      ): void;
      rejectsWith(error: Error): void;
      reset(): void;
    };
  };
}

const clientFns: (keyof ClientFns)[] = ["$connect", "$disconnect"];

const spies = new Set<jest.SpyInstance>();
const matchers = new Map<object, any>();

function normalizeSql(input: string): string {
  return input.replace(/\s+/gm, " ").replace(/^\s+|\s+$/g, "");
}

const mockClient = new PrismaClient() as MockPrismaClient;
mockClient.$use(async (params) => {
  for (let [matcher, impl] of matchers.entries()) {
    try {
      expect(params).toMatchObject(matcher);
      matchers.delete(matcher);
      return impl(params);
    } catch (error) {}
  }
  throw new Error(
    `No matchers defined for query ${JSON.stringify(params, null, 2)}`
  );
});

["$executeRaw", "$queryRaw"].forEach((method) => {
  jest.spyOn(mockClient, method as any).mockImplementation(async (...args) => {
    const query = (Prisma.sql as any)(...args);
    const params = {
      model: "prisma",
      action: method,
      args: { sql: normalizeSql(query.sql), values: query.values },
    };
    for (let [matcher, impl] of matchers.entries()) {
      try {
        expect(params).toMatchObject(matcher);
        matchers.delete(matcher);
        return impl(query);
      } catch (error) {}
    }
    throw new Error(
      `No matchers defined for query ${JSON.stringify(params, null, 2)}`
    );
  });
});

jest
  .spyOn(mockClient, "$transaction")
  .mockImplementation((p) => Promise.all(p));

clientFns.forEach((method) =>
  spies.add(jest.spyOn(mockClient, method).mockResolvedValue(undefined))
);

beforeEach(() => spies.forEach((spy) => spy.mockClear()));
afterEach(() => {
  try {
    if (matchers.size) {
      throw new Error(
        [
          `The following ${matchers.size} matcher(s) were not matched during the last test run:`,
          ...[...matchers.keys()].map(
            (matcher) => ` - ${JSON.stringify(matcher)}`
          ),
        ].join("\n")
      );
    }
  } finally {
    matchers.clear();
  }
});

const makeMatcher = (matcher: object) => ({
  hasImplementation: (implementation: any) =>
    matchers.set(matcher, (params: Parameters<typeof implementation>[0]) =>
      Promise.resolve(params).then(implementation)
    ),
  resolvesTo: (result: any) =>
    matchers.set(matcher, () => Promise.resolve(result)),
  rejectsWith: (error: any) =>
    matchers.set(matcher, () => Promise.reject(error)),
  reset: () => matchers.delete(matcher),
});

const mockModels = (model: keyof ModelDelegates) => ({
  action: (action: string) => ({
    with: (args: any) => {
      return makeMatcher({
        model: model.replace(/^[a-z]/, (a) => a.toUpperCase()) as any,
        action: action as any,
        args,
      });
    },
  }),
});

function makeMockSql(method: "$executeRaw" | "$queryRaw") {
  return {
    with: (query: Prisma.Sql) => {
      return makeMatcher({
        model: "prisma",
        action: method,
        args: { sql: normalizeSql(query.sql), values: query.values },
      });
    },
  };
}

// mockSql lets you mock executeRaw calls. You use it to expect a specific SQL
// query, and you can use string interpolation to expect the arguments. The
// interpolated values can be literal or standard jest expect matchers.
// Example:
// mockSql("$executeRaw").with(
//   Prisma.sql`SELECT * FROM table LIMIT ${expect.any(Number)}`
// );
const mockSql = (method: "$executeRaw" | "$queryRaw") => makeMockSql(method);

export default mockClient;
export { Prisma, mockModels, mockSql };
export * from "@prisma/client";
