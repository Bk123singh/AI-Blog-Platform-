import ImageKit from "imagekit";

export const isImageKitConfigured = () => {
  const pk = process.env.IMAGEKIT_PUBLIC_KEY || "";
  const sk = process.env.IMAGEKIT_PRIVATE_KEY || "";
  const ep = process.env.IMAGEKIT_URL_ENDPOINT || "";

  return (
    pk.trim() !== "" &&
    sk.trim() !== "" &&
    ep.trim() !== "" &&
    !pk.includes("placeholder") &&
    !pk.startsWith("your_") &&
    !ep.includes("your_endpoint")
  );
};

const imagekit = new ImageKit({
  publicKey: process.env.IMAGEKIT_PUBLIC_KEY || "placeholder_public_key",
  privateKey: process.env.IMAGEKIT_PRIVATE_KEY || "placeholder_private_key",
  urlEndpoint:
    process.env.IMAGEKIT_URL_ENDPOINT || "https://ik.imagekit.io/placeholder",
});

export default imagekit;