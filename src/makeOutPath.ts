export function makeOutPath(path: string, suffix: string, outDir: string): URL {
  const p = path.replaceAll("/", "_");
  return new URL(`./${p}.${suffix}.png`, outDir);
}
