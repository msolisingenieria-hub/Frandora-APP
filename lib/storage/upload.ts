import { PutObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { r2, R2_BUCKET, R2_PUBLIC_URL } from "./r2";
import { nanoid } from "nanoid";

type UploadFolder = "logos" | "banners" | "services" | "staff" | "before-after" | "documents";

const MAX_SIZES: Record<UploadFolder, number> = {
  logos: 2 * 1024 * 1024,        // 2MB
  banners: 5 * 1024 * 1024,      // 5MB
  services: 3 * 1024 * 1024,     // 3MB
  staff: 2 * 1024 * 1024,        // 2MB
  "before-after": 5 * 1024 * 1024, // 5MB
  documents: 10 * 1024 * 1024,   // 10MB
};

const ALLOWED_TYPES: Record<UploadFolder, string[]> = {
  logos: ["image/png", "image/jpeg", "image/webp", "image/svg+xml"],
  banners: ["image/png", "image/jpeg", "image/webp"],
  services: ["image/png", "image/jpeg", "image/webp"],
  staff: ["image/png", "image/jpeg", "image/webp"],
  "before-after": ["image/png", "image/jpeg", "image/webp"],
  documents: ["application/pdf"],
};

export async function getUploadUrl({
  businessId,
  folder,
  contentType,
  fileSize,
}: {
  businessId: string;
  folder: UploadFolder;
  contentType: string;
  fileSize: number;
}): Promise<{ uploadUrl: string; key: string; publicUrl: string }> {
  if (!ALLOWED_TYPES[folder].includes(contentType)) {
    throw new Error(`Tipo de archivo no permitido para ${folder}`);
  }
  if (fileSize > MAX_SIZES[folder]) {
    throw new Error(`El archivo supera el tamaño máximo permitido`);
  }

  const ext = contentType.split("/")[1].replace("svg+xml", "svg");
  const key = `${folder}/${businessId}/${nanoid(12)}.${ext}`;

  const command = new PutObjectCommand({
    Bucket: R2_BUCKET,
    Key: key,
    ContentType: contentType,
    ContentLength: fileSize,
  });

  const uploadUrl = await getSignedUrl(r2, command, { expiresIn: 300 });
  const publicUrl = `${R2_PUBLIC_URL}/${key}`;

  return { uploadUrl, key, publicUrl };
}

export async function deleteFile(key: string): Promise<void> {
  await r2.send(new DeleteObjectCommand({ Bucket: R2_BUCKET, Key: key }));
}
