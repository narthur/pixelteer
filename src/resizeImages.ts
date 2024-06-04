import sharp, { type Sharp } from "sharp";

type Options = {
  prodIn: Buffer;
  localIn: Buffer;
};

function resizeImage(image: Sharp, width: number, height: number) {
  return image.resize({
    width,
    height,
    fit: "contain",
    position: "left top",
  });
}

export default async function resizeImages({
  prodIn,
  localIn,
}: Options): Promise<{
  prodOut: Buffer;
  localOut: Buffer;
  width: number;
  height: number;
}> {
  const sharpProd = sharp(prodIn);
  const sharpLocal = sharp(localIn);
  const metaProd = await sharpProd.metadata();
  const metaLocal = await sharpLocal.metadata();

  if (
    !metaProd.width ||
    !metaProd.height ||
    !metaLocal.width ||
    !metaLocal.height
  ) {
    throw new Error("Missing image size data");
  }

  const width = Math.max(metaProd.width, metaLocal.width);
  const height = Math.max(metaProd.height, metaLocal.height);

  const prodOut =
    metaProd.width !== width || metaProd.height !== height
      ? resizeImage(sharpProd, width, height)
      : sharpProd;
  const localOut =
    metaLocal.width !== width || metaLocal.height !== height
      ? resizeImage(sharpLocal, width, height)
      : sharpLocal;

  return {
    prodOut: await prodOut.raw().toBuffer(),
    localOut: await localOut.raw().toBuffer(),
    width,
    height,
  };
}
