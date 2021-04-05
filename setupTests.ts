import "@testing-library/jest-dom/extend-expect";

jest.mock("./components/Session", () => {
  return {
    ...jest.requireActual("./components/Session"),
    SessionProvider: ({ children }: any) => children,
    useSession: () => ({ session: { loading: true }, refresh: async () => {} }),
  };
});
