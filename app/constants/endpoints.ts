import { format } from "date-fns";
import type { AccessLevel } from "./accessLevel";
import type { NoteContentType } from "./noteContentType";

export type GetNotesParams = {
	date?: Date;
	startDate?: Date;
	endDate?: Date;
	q?: string;
	tagIds?: string[];
	accessLevel?: AccessLevel;
	contentType?: NoteContentType;
	limit?: number;
	offset?: number;
	hasImages?: boolean;
};

export type GetNoteDaysParams = {
	startDate: Date;
	endDate: Date;
};

export const endpoints = {
	auth: {
		login: "/v1/auth/google/login",
		logout: "/v1/auth/logout",
		callback: "/v1/auth/google/callback",
	},
	users: {
		me: "/v1/users/me",
	},
	notes: {
		getNotes: (params?: GetNotesParams) => {
			let path = "/v1/notes";
			const queryParams: string[] = [];

			if (params) {
				const {
					date,
					startDate,
					endDate,
					q,
					tagIds,
					accessLevel,
					contentType,
					limit,
					offset,
					hasImages,
				} = params;

				if (date) queryParams.push(`date=${format(date, "yyyy-MM-dd")}`);
				if (startDate) queryParams.push(`startDate=${format(startDate, "yyyy-MM-dd")}`);
				if (endDate) queryParams.push(`endDate=${format(endDate, "yyyy-MM-dd")}`);
				if (q) queryParams.push(`q=${encodeURIComponent(q)}`);
				if (tagIds && tagIds.length > 0) {
					for (const tagId of tagIds) {
						queryParams.push(`tagIds=${tagId}`);
					}
				}
				if (accessLevel) queryParams.push(`accessLevel=${accessLevel}`);
				if (contentType) queryParams.push(`contentType=${contentType}`);
				if (limit !== undefined) queryParams.push(`limit=${limit}`);
				if (offset !== undefined) queryParams.push(`offset=${offset}`);
				if (hasImages !== undefined) queryParams.push(`hasImages=${hasImages}`);
			}

			if (queryParams.length > 0) {
				path += `?${queryParams.join("&")}`;
			}

			return path;
		},
		days: (params: GetNoteDaysParams) => {
			const queryParams = [
				`startDate=${format(params.startDate, "yyyy-MM-dd")}`,
				`endDate=${format(params.endDate, "yyyy-MM-dd")}`,
			];
			return `/v1/notes/days?${queryParams.join("&")}`;
		},
		create: "/v1/notes",
		update: (id: string) => `/v1/notes/${id}`,
		delete: (id: string) => `/v1/notes/${id}`,
	},
	image: {
		getUploadUrl: "/v1/image/upload-url",
	},
	wines: {
		recognize: "/v1/wine-labels/recognize",
	},
	tags: {
		list: "/v1/tags",
		create: "/v1/tags",
		update: (id: string) => `/v1/tags/${id}`,
		delete: (id: string) => `/v1/tags/${id}`,
	},
};
