import getSitemap from "./getSitemap.js";
import puppeteer from "puppeteer";
import { handleUrl } from "./handleUrl.js";
import { CompareUrlsOptions } from "./compareUrls.js";

export async function takeScreenshots({
  baseUrl1,
  baseUrl2,
  paths,
  outDir,
  diffThreshold,
  saveThreshold,
}: CompareUrlsOptions): Promise<Promise<unknown>[]> {
  const browser = await puppeteer.launch({
    headless: true,
  });
  const page = await browser.newPage();
  const count = paths.length;

  await page.setRequestInterception(true);

  page.on("request", (req) => {
    if (req.resourceType() === "image" || req.resourceType() === "script") {
      req.abort();
    } else {
      req.continue();
    }
  });

  const promises = paths.map((path) =>
    handleUrl({
      page,
      path,
      baseUrl1,
      baseUrl2,
      outDir,
      diffThreshold,
      saveThreshold,
    })
  );

  Promise.allSettled(promises).then(() => browser.close());

  return promises;
}
