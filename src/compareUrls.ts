import fs from "fs";
import { takeScreenshots } from "./takeScreenshots.js";

export type CompareUrlsOptions = {
  baseUrl1: string;
  baseUrl2: string;
  paths: string[];
  outDir: string;
  force?: boolean;
  diffThreshold?: number;
  saveThreshold?: number;
};

export function compareUrls(
  options: CompareUrlsOptions
): Promise<Promise<unknown>[]> {
  if (!fs.existsSync(options.outDir)) {
    fs.mkdirSync(options.outDir);
  }

  const isEmpty = fs.readdirSync(options.outDir).length === 0;

  if (!isEmpty && !options.force) {
    throw new Error("Directory is not empty. Use `force` to overwrite.");
  }

  return takeScreenshots(options);
}
