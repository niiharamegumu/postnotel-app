export type Tag = {
	id: string;
	name: string;
};

export type Tags = {
	tags: Tag[];
	count: number;
};

export type TagsResponse = Tags;

export type CreateTagRequest = {
	name: string;
};
