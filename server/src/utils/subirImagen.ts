import cloudinary from "../config/cloudinary";

export const subirImagen = (
    buffer: Buffer,
): Promise<{
    secure_url: string;
    public_id: string;
}> => {
    return new Promise((resolve, reject) => {

        const stream = cloudinary.uploader.upload_stream(
            {
                folder: "academias/flyers",
            },
            (error, resultado) => {

                if (error) {
                    reject(error);
                    return;
                }

                if (!resultado) {
                    reject(new Error("Cloudinary no devolvió información"));
                    return;
                }

                resolve({
                    secure_url: resultado.secure_url,
                    public_id: resultado.public_id,
                });
            },
        );

        stream.end(buffer);
    });
};