import type { AccessLevel } from "~/constants/accessLevel";
import type { NoteContentType } from "~/constants/noteContentType";
import type { Tag } from "~/features/tags/types/tag";

export type UploadUrlResponse = {
	url: string;
	fileName: string;
	method: string;
	expires: number;
	storageBaseUrl: string;
};

export type GenerationStatus = "done" | "pending" | "error";

export type NoteImage = {
	noteImageId: string;
	imageUrl: string;
	note: {
		noteId: string;
		content: string;
		accessLevel: AccessLevel;
		tags: {
			tags: Tag[];
			count: number;
		};
		generationStatus: GenerationStatus;
		contentType: NoteContentType;
		createdAt: string;
		updatedAt: string;
	};
};

export type NoteImagesWithPaginationResponse = {
	noteImages: NoteImage[];
	pagination: {
		total: number;
		count: number;
		offset: number;
		limit: number;
		hasNext: boolean;
		hasPrevious: boolean;
	};
};
