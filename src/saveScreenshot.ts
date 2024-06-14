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
  let attempt = 0;
  const maxAttempts = 10;
  let delay = 100; // Initial delay in milliseconds

  while (attempt < maxAttempts) {
    try {
      const loadingPromise = page.waitForNavigation({
        timeout: 0,
        waitUntil: "domcontentloaded",
      });

      await page.goto(url);
      await page.addStyleTag({ content: css });

      // Use a dynamic delay based on the attempt count
      await new Promise((resolve) => setTimeout(resolve, delay));

      const timeoutPromise = new Promise<never>((_, reject) => {
        setTimeout(() => {
          reject(new Error("Timeout"));
        }, 10000);
      });

      await Promise.race([loadingPromise, timeoutPromise]);

      const buffer = await page.screenshot({
        fullPage: true,
        optimizeForSpeed: true,
      });

      return buffer; // Successful capture, return the buffer
    } catch (error: unknown) {
      attempt++;
      if (attempt >= maxAttempts) {
        throw error; // Exceeded max attempts, rethrow the last error
      }

      // Exponential backoff: double the delay for the next attempt
      delay *= 2;

      // Optionally log the retry attempt
      console.warn(`Retry attempt ${attempt} after error:`);
      console.log(error);
    }
  }

  // This line should never be reached due to the throw in the catch block
  throw new Error("Unexpected error in captureScreenshotWithRetry");
}
