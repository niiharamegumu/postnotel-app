import { format } from "date-fns";

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
		notesByDate: (date: Date) => `/v1/notes?date=${format(date, "yyyy-MM-dd")}`,
		days: "/v1/notes/days",
	},
};
