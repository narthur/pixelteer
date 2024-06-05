import fs from "fs";
import { takeScreenshots } from "./takeScreenshots.js";
import { PathResult } from "./handlePath.js";

export type CompareUrlsOptions = {
  baseUrl1: string;
  baseUrl2: string;
  paths: string[];
  outDir: string;
  force?: boolean;
  diffThreshold?: number;
  saveThreshold?: number;
  onSuccess?: (result: PathResult) => void;
  onError?: (e: unknown) => void;
};

export async function compareUrls(options: CompareUrlsOptions): Promise<void> {
  if (!fs.existsSync(options.outDir)) {
    fs.mkdirSync(options.outDir);
  }

  const isEmpty = fs.readdirSync(options.outDir).length === 0;

  if (!isEmpty && !options.force) {
    throw new Error("Directory is not empty. Use `force` to overwrite.");
  }

  await takeScreenshots(options);
}
