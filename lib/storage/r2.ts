import { S3Client } from "@aws-sdk/client-s3";

const ACCOUNT_ID = "f5463d3d297740798f5a30d77ab098c7";

export const r2 = new S3Client({
  region: "auto",
  endpoint: `https://${ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: process.env.CLOUDFLARE_R2_ACCESS_KEY_ID!,
    secretAccessKey: process.env.CLOUDFLARE_R2_SECRET_ACCESS_KEY!,
  },
});

export const R2_BUCKET = process.env.CLOUDFLARE_R2_BUCKET_NAME ?? "frandora-storage";

export const R2_PUBLIC_URL = `https://pub-${ACCOUNT_ID}.r2.dev`;
