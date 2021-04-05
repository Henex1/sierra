import { getPage } from "next-page-tester";
import { screen } from "@testing-library/react";
import Home from "./index";

process.on("unhandledRejection", (reason) => {
  console.log("REJECTION", reason);
});
describe("Home", () => {
  it("renders without crashing", async () => {
    const { render } = await getPage({
      route: "/",
    });
    render();
    expect(
      screen.getByRole("heading", { name: "Project Sierra", level: 5 })
    ).toBeInTheDocument();
  });
});
