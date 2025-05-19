export enum AccessLevel {
	Private = "private",
	Public = "public",
}

export const accessLevelLabels: Record<AccessLevel, string> = {
	[AccessLevel.Private]: "Private",
	[AccessLevel.Public]: "Public",
};
