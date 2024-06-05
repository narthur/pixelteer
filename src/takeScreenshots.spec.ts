import { describe, it, expect, vi } from "vitest";
import { takeScreenshots } from "./takeScreenshots.js";
import { handleUrl } from "./handleUrl.js";
import puppeteer from "puppeteer";

vi.mock("./handleUrl");

describe("takeScreenshots", () => {
  it("does not close browser too early", async () => {
    const { promise, resolve } = Promise.withResolvers();

    vi.mocked(handleUrl).mockReturnValue(promise as any);

    await takeScreenshots({
      baseUrl1: "https://example.com",
      baseUrl2: "https://example.com",
      paths: ["/"],
      outDir: "out",
    });

    const browser = vi.mocked(puppeteer.launch).mock.results[0].value;

    expect(browser.close).not.toBeCalled();

    resolve(null);
  });
});
