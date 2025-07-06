import { z } from "zod";

export const tagNameSchema = z
	.string()
	.min(1, "タグ名は必須です")
	.max(20, "タグ名は20文字以下で入力してください")
	.regex(/^[^\s]+$/, "タグ名に空白は含められません");

export const createTagSchema = z.object({
	name: tagNameSchema,
});

export const tagSelectionSchema = z.object({
	tagIds: z.array(z.string()).optional(),
});

export type CreateTagSchema = z.infer<typeof createTagSchema>;
export type TagSelectionSchema = z.infer<typeof tagSelectionSchema>;