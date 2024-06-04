import { Page } from "puppeteer";
import fs from "fs";

const cssUrl = new URL("./inject.css", import.meta.url);
const css = fs.readFileSync(cssUrl, "utf8");

type Options = {
  url: string;
  page: Page;
};

export default async function takeScreenshot({
  page,
  url,
}: Options): Promise<Buffer> {
  const loadingPromise = page.waitForNavigation({
    waitUntil: "domcontentloaded",
  });

  await page.goto(url);
  await page.addStyleTag({ content: css });
  await loadingPromise;

  const buffer = await page.screenshot({
    fullPage: true,
    optimizeForSpeed: true,
  });

  return buffer;
}
