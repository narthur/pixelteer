export function makeOutPath(
  path: string,
  suffix: string,
  outDir: string
): string {
  const p = path.replaceAll("/", "_");
  return `${outDir}/${p}.${suffix}.png`;
}
