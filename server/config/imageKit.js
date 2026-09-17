import ImageKit from "imagekit";

export const isImageKitConfigured = () => {
  return Boolean(
    process.env.IMAGEKIT_PUBLIC_KEY &&
    process.env.IMAGEKIT_PRIVATE_KEY &&
    process.env.IMAGEKIT_URL_ENDPOINT &&
    !process.env.IMAGEKIT_PUBLIC_KEY.includes("placeholder")
  );
};

const imagekit = new ImageKit({
  publicKey: process.env.IMAGEKIT_PUBLIC_KEY || "placeholder_public_key",
  privateKey: process.env.IMAGEKIT_PRIVATE_KEY || "placeholder_private_key",
  urlEndpoint: process.env.IMAGEKIT_URL_ENDPOINT || "https://ik.imagekit.io/placeholder",
});

export default imagekit;