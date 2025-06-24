import { format } from "date-fns";

export type GetNotesParams = {
	date?: Date;
	q?: string;
	tagIds?: string[];
	accessLevel?: string;
	contentType?: string;
	limit?: number;
	offset?: number;
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
				const { date, q, tagIds, accessLevel, contentType, limit, offset } = params;

				if (date) queryParams.push(`date=${format(date, "yyyy-MM-dd")}`);
				if (q) queryParams.push(`q=${encodeURIComponent(q)}`);
				if (tagIds && tagIds.length > 0) queryParams.push(`tagIds=${tagIds.join(",")}`);
				if (accessLevel) queryParams.push(`accessLevel=${accessLevel}`);
				if (contentType) queryParams.push(`contentType=${contentType}`);
				if (limit !== undefined) queryParams.push(`limit=${limit}`);
				if (offset !== undefined) queryParams.push(`offset=${offset}`);
			}

			if (queryParams.length > 0) {
				path += `?${queryParams.join("&")}`;
			}

			return path;
		},
		days: "/v1/notes/days",
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
};
