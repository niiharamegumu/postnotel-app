export enum AllowImageContentType {
	ImageJpeg = "image/jpeg",
	ImagePng = "image/png",
}
export enum AllowImageFileExtension {
	Jpg = "jpg",
	Jpeg = "jpeg",
	Png = "png",
}
export const allowedImageContentTypes: string[] = Object.values(AllowImageContentType);
export const allowedImageFileExtensions: string[] = Object.values(AllowImageFileExtension);

export const imageCompressionOptions = {
	maxSizeMB: 0.2,
	maxWidthOrHeight: 5000,
	useWebWorker: true,
};
