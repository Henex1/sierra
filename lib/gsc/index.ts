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

const gcsBucketName = requireEnv("GOOGLE_STORAGE_BUCKET");
export async function uploadFileToGCS(
  name: string,
  file: Blob | string,
  path = ""
): Promise<string> {
  const storage = getStorage(); // TODO reuse storage client?
  let bucket = storage.bucket(gcsBucketName);

  const [bucketExist] = await bucket.exists();
  if (!bucketExist) {
    if (process.env.NODE_ENV === "development") {
      await storage.createBucket(gcsBucketName);
      bucket = storage.bucket(gcsBucketName);
    } else {
      throw "Storage bucket " + gcsBucketName + " does not exist";
    }
  }

  const bucketFile = bucket.file(path + name);
  if (typeof file === "string") {
    const base64EncodedString = file.replace(/^data:\w+\/\w+;base64,/, "");
    const fileBuffer = Buffer.from(base64EncodedString, "base64");
    await bucketFile.save(fileBuffer, {});
  } else {
    await bucketFile.save(get(file, "buffer", file), {});
  }

  try {
    await bucket.file(path + name).makePublic();
  } catch (e) {
    console.error("Error while setting uploaded file public", e);
  }
  return bucket.file(path + name).publicUrl();
}
