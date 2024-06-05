import { describe, it, vi } from "vitest";
import { takeScreenshots } from "./takeScreenshots.js";

vi.mock("./handleUrl");

describe("takeScreenshots", () => {
  it("runs", async () => {
    await takeScreenshots({
      baseUrl1: "https://example.com",
      baseUrl2: "https://example.com",
      paths: ["/"],
      outDir: "out",
    });
  });
});
