import { PutObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";
import { s3Client } from "../config/r2";
import crypto from "crypto";

export async function subirImagenR2(
  buffer: Buffer,
  nombreOriginal: string,
  mimetype: string,
  filename: string = "flyers/"
): Promise<string> {
  const fileExtension = nombreOriginal.split(".").pop();
  const carpeta = filename && filename.trim() ? filename.trim() : "flyers/";
  const fileName = `${carpeta}${crypto.randomUUID()}.${fileExtension}`;

  await s3Client.send(
    new PutObjectCommand({
      Bucket: process.env.R2_BUCKET_NAME,
      Key: fileName,
      Body: buffer,
      ContentType: mimetype,
    })
  );

  return fileName; // Retorna la Key (ej: "flyers/uuid-1234.jpg")
}

export const eliminarImagenR2 = async (urlCompleta: string) => {
  try {
    const urlObj = new URL(urlCompleta);
    const objectKey = decodeURIComponent(
      urlObj.pathname.startsWith("/") ? urlObj.pathname.slice(1) : urlObj.pathname
    );

    const comando = new DeleteObjectCommand({
      Bucket: process.env.R2_BUCKET_NAME,
      Key: objectKey,
    });

    await s3Client.send(comando);

    return { success: true, message: "Imagen eliminada de R2 correctamente" };
  } catch (error) {
    console.error("Error al eliminar la imagen de Cloudflare R2:", error);
    throw new Error("No se pudo eliminar la imagen del almacenamiento");
  }
};