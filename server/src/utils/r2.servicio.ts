import { PutObjectCommand } from "@aws-sdk/client-s3";
import { s3Client } from "../config/r2"; // Ajustá la ruta según tu estructura
import crypto from "crypto";

export async function uploadFileToR2(file: Express.Multer.File, folder: string = "general"): Promise<string> {
  // Generamos un nombre único para evitar que se pisen archivos con el mismo nombre
  const fileExtension = file.originalname.split(".").pop();
  const fileName = `${folder}/${crypto.randomUUID()}.${fileExtension}`;

  const uploadParams = {
    Bucket: process.env.R2_BUCKET_NAME,
    Key: fileName,
    Body: file.buffer,
    ContentType: file.mimetype,
  };

  try {
    await s3Client.send(new PutObjectCommand(uploadParams));
    
    // Devolvemos la ruta o URL pública si tu bucket es público (o la key para guardarla en MySQL)
    return fileName; 
  } catch (error) {
    console.error("Error al subir archivo a R2:", error);
    throw new Error("No se pudo subir la imagen");
  }
}