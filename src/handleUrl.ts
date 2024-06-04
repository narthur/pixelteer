import fs from "fs";
import pixelmatch from "pixelmatch";
import { PNG } from "pngjs";
import takeScreenshot from "./saveScreenshot.js";
import resizeImages from "./resizeImages.js";
import { Browser, Page } from "puppeteer";
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

export async function handleUrl({
  page,
  path,
  baseUrl1,
  baseUrl2,
  outDir,
  diffThreshold = 0.2,
  saveThreshold = 10,
}: Options) {
  const _prod = await takeScreenshot({
    page,
    url: `${baseUrl1}${path}`,
  });

  const _local = await takeScreenshot({
    page,
    url: `${baseUrl2}${path}`,
  });

  const { prodOut, localOut, width, height } = await resizeImages({
    prodIn: _prod,
    localIn: _local,
  });

  const diff = new PNG({ width, height });

  const c = pixelmatch(prodOut, localOut, diff.data, width, height, {
    threshold: diffThreshold,
  });

  if (c > saveThreshold) {
    fs.writeFileSync(makeOutPath(path, "1", outDir), _prod);
    fs.writeFileSync(makeOutPath(path, "2", outDir), _local);
    fs.writeFileSync(makeOutPath(path, "diff", outDir), PNG.sync.write(diff));
  }

  return c;
}
