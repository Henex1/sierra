import { Storage } from "@google-cloud/storage";
import { requireEnv } from "../env";
import { get } from "lodash";

const getStorage = () => {
  if (process.env.NODE_ENV !== "production") {
    // eslint-disable-next-line sierra/process-env
    process.env["NODE_TLS_REJECT_UNAUTHORIZED"] = "0";
    return new Storage({
      apiEndpoint: "https://localhost:4443",
      retryOptions: {
        totalTimeout: 5000,
      },
      projectId: "test",
    });
  } else {
    return new Storage();
  }
};

export async function uploadFileToGC(
  name: string,
  file: Blob | string
): Promise<string> {
  // Creates a client
  const storage = getStorage();
  const bucketName = requireEnv("GOOGLE_STORAGE_BUCKET");
  const fileOptions = { public: true };

  const [bucketExist] = await storage.bucket(bucketName).exists();
  if (!bucketExist) {
    await storage.createBucket(bucketName);
  }

  const bucketFile = storage.bucket(bucketName).file(name);

  if (typeof file === "string") {
    const base64EncodedString = file.replace(/^data:\w+\/\w+;base64,/, "");
    const fileBuffer = Buffer.from(base64EncodedString, "base64");
    await bucketFile.save(fileBuffer, fileOptions);
  } else {
    await bucketFile.save(get(file, "buffer", file), fileOptions);
  }

  return storage.bucket(bucketName).file(name).publicUrl();
}
