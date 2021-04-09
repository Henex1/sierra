import { screen } from "@testing-library/react";

import { getPage } from "../lib/test";
import Home from "./index";

describe("Home", () => {
  it("renders without crashing", async () => {
    const { render } = await getPage({
      route: "/",
    });
    render();
    expect(
      screen.getByRole("heading", { name: "Project Sierra", level: 1 })
    ).toBeInTheDocument();
  });
});
