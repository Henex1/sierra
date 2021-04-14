import { screen } from "@testing-library/react";

import { getPage } from "../lib/test";

describe("Home", () => {
  it("renders without crashing", async () => {
    const { render } = await getPage({
      route: "/",
    });
    render();
    expect(screen.getByTestId("home-root")).toHaveLength(1);
  });
});
