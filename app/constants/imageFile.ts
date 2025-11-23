export enum AllowImageContentType {
	ImageJpeg = "image/jpeg",
	ImagePng = "image/png",
	ImageWebp = "image/webp",
}
export enum AllowImageFileExtension {
	Jpg = "jpg",
	Jpeg = "jpeg",
	Png = "png",
	Webp = "webp",
}
export const allowedImageContentTypes: string[] = Object.values(AllowImageContentType);
export const allowedImageFileExtensions: string[] = Object.values(AllowImageFileExtension);

// Ensures resized images remain suitable for desktop and mobile screens.
export const imageCompressionMaxDimension = 2500;

export const imageCompressionOptions = {
	maxSizeMB: 0.4,
	maxWidthOrHeight: imageCompressionMaxDimension,
	fileType: "image/webp",
	useWebWorker: true,
};
