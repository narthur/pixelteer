import puppeteer from "puppeteer";
import { handlePath } from "./handlePath.js";
import { CompareUrlsOptions } from "./compareUrls.js";

export async function takeScreenshots({
  baseUrl1,
  baseUrl2,
  paths,
  outDir,
  diffThreshold,
  saveThreshold,
  onSuccess = () => {},
  onError = (e: unknown) => {
    throw e;
  },
}: CompareUrlsOptions): Promise<void> {
  const browser = await puppeteer.launch({
    headless: true,
    handleSIGINT: false,
  });
  const page = await browser.newPage();

  await page.setRequestInterception(true);

  page.on("request", (req) => {
    if (req.resourceType() === "image" || req.resourceType() === "script") {
      req.abort();
    } else {
      req.continue();
    }
  });

  const total = paths.length;

  for (const [i, path] of paths.entries()) {
    await handlePath({
      page,
      path,
      baseUrl1,
      baseUrl2,
      outDir,
      diffThreshold,
      saveThreshold,
    })
      .then((result) => onSuccess({ ...result, total, current: i + 1 }))
      .catch(onError);
  }

  browser.close();
}
