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
export type QueryMatcher = Partial<Prisma.MiddlewareParams>;

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

const clientFns: (keyof ClientFns)[] = [
  "$connect",
  "$disconnect",
  "$executeRaw",
  "$queryRaw",
  "$transaction",
];

const spies = new Set<jest.SpyInstance>();
const matchers = new Map<QueryMatcher, any>();

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

const mockModels = (model: keyof ModelDelegates) => ({
  action: (action: string) => ({
    with: (args: any) => {
      const matcher = {
        model: model.replace(/^[a-z]/, (a) => a.toUpperCase()) as any,
        action: action as any,
        args,
      };
      return {
        hasImplementation: (implementation: any) =>
          matchers.set(
            matcher,
            (params: Parameters<typeof implementation>[0]) =>
              Promise.resolve(params).then(implementation)
          ),
        resolvesTo: (result: any) =>
          matchers.set(matcher, () => Promise.resolve(result)),
        rejectsWith: (error: any) =>
          matchers.set(matcher, () => Promise.reject(error)),
        reset: () => matchers.delete(matcher),
      };
    },
  }),
});

export default mockClient;
export { mockModels };
export * from "@prisma/client";
