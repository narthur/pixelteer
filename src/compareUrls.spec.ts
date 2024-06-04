import pixelmatch from "pixelmatch";
import { describe, it, expect, beforeEach, vi } from "vitest";
import { compareUrls, CompareUrlsOptions } from "./compareUrls.js";
import getSitemap from "./getSitemap.js";
import readScreenshot from "./readScreenshot.js";
import resizeImages from "./resizeImages.js";
import fs from "fs";

async function run(options: Partial<CompareUrlsOptions> = {}) {
  return Promise.all(
    await compareUrls({
      baseUrl1: "the_base_url_1",
      baseUrl2: "the_base_url_2",
      paths: ["the_path"],
      outDir: "file://the_out_dir",
      ...options,
    })
  );
}

describe("puppeteer", () => {
  beforeEach(() => {
    vi.mocked(getSitemap).mockResolvedValue(["https://example.com"]);

    vi.mocked(readScreenshot)
      .mockReturnValueOnce({
        metadata: () => ({
          width: 1,
          height: 1,
        }),
        toBuffer: () => Buffer.from(""),
      } as any)
      .mockReturnValueOnce({
        metadata: () => ({
          width: 100,
          height: 100,
        }),
        toBuffer: () => Buffer.from(""),
      } as any);

    vi.mocked(fs.readdirSync).mockReturnValue([]);
  });

  it("uses max width and max height", async () => {
    await run({});

    expect(pixelmatch).toBeCalledWith(
      expect.anything(),
      expect.anything(),
      undefined,
      100,
      100,
      expect.anything()
    );
  });

  it("resizes images", async () => {
    await run({});

    expect(resizeImages).toBeCalledTimes(1);
  });

  it("does not run if shots is not empty", async () => {
    vi.mocked(fs.readdirSync).mockReturnValue(["foo" as any]);

    await run({}).catch(() => {});

    expect(resizeImages).toBeCalledTimes(0);
  });

  it("runs if shots is not empty and force arg provided", async () => {
    vi.mocked(fs.readdirSync).mockReturnValue(["foo" as any]);

    await run({ force: true });

    expect(resizeImages).toBeCalledTimes(1);
  });

  it("writes screenshot to outdir", async () => {
    vi.mocked(pixelmatch).mockReturnValue(1000);
    await run({ paths: ["the_path"] });

    expect(fs.writeFileSync).toBeCalledWith(
      new URL("file://the_out_dir/the_path.1.png"),
      undefined
    );
  });
});
