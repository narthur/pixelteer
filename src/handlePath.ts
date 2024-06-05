import fs from "fs";
import pixelmatch from "pixelmatch";
import { PNG } from "pngjs";
import takeScreenshot from "./saveScreenshot.js";
import resizeImages from "./resizeImages.js";
import { Page } from "puppeteer";
import { makeOutPath } from "./makeOutPath.js";

type Options = {
  page: Page;
  path: string;
  baseUrl1: string;
  baseUrl2: string;
  outDir: string;
  diffThreshold?: number;
  saveThreshold?: number;
};

export type PathResult = {
  path: string;
  diff: number;
  ms: number;
};

export async function handlePath({
  page,
  path,
  baseUrl1,
  baseUrl2,
  outDir,
  diffThreshold = 0.2,
  saveThreshold = 10,
}: Options): Promise<PathResult> {
  const start = new Date().getTime();
  const buffer1 = await takeScreenshot({
    page,
    url: `${baseUrl1}${path}`,
  });

  const buffer2 = await takeScreenshot({
    page,
    url: `${baseUrl2}${path}`,
  });

  const { out1, out2, width, height } = await resizeImages({
    buffer1: buffer1,
    buffer2: buffer2,
  });

  const diff = new PNG({ width, height });

  const c = pixelmatch(out1, out2, diff.data, width, height, {
    threshold: diffThreshold,
  });

  if (c > saveThreshold) {
    fs.writeFileSync(makeOutPath(path, "1", outDir), buffer1);
    fs.writeFileSync(makeOutPath(path, "2", outDir), buffer2);
    fs.writeFileSync(makeOutPath(path, "diff", outDir), PNG.sync.write(diff));
  }

  return { path, diff: c, ms: new Date().getTime() - start };
}
