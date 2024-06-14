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
    timeout: 0,
    waitUntil: "domcontentloaded",
  });

  await page.goto(url);
  await page.addStyleTag({ content: css });

  // Don't pound the database too hard
  await new Promise((resolve) => setTimeout(resolve, 100));

  // Use our own timeout that we can more easily catch
  const timeoutPromise = new Promise<never>((_, reject) => {
    setTimeout(() => {
      reject(new Error("Timeout"));
    }, 60000);
  });

  await Promise.race([loadingPromise, timeoutPromise]);

  const buffer = await page.screenshot({
    fullPage: true,
    optimizeForSpeed: true,
  });

  return buffer;
}
