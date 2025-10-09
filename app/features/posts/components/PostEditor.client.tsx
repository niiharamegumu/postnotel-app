import { BlockNoteSchema, defaultBlockSpecs } from "@blocknote/core";
import { BlockNoteView } from "@blocknote/mantine";
import { useCreateBlockNote } from "@blocknote/react";
import { Eye, EyeOff, ImagePlus, Tags } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { Button } from "~/components/ui/button";
import { AccessLevel } from "~/constants/accessLevel";
import type { Post } from "~/features/posts/types/post";
import { TagBadge } from "~/features/tags/components/TagBadge";
import { TagSelector } from "~/features/tags/components/TagSelector";
import { useTags } from "~/features/tags/hooks/useTags";
import type { Tag } from "~/features/tags/types/tag";
import { useImageUpload } from "~/hooks/useImageUpload";
import { cn } from "~/lib/utils";

export type PostEditorSubmitPayload = {
	content: string;
	accessLevel: AccessLevel;
	tagIds: string[];
	images: string[];
};

type PostEditorProps = {
	post?: Post | null;
	submitting: boolean;
	submitLabel: string;
	onSubmit: (payload: PostEditorSubmitPayload) => Promise<void> | void;
};

const EDITOR_INITIALIZED_DELAY_MS = 120;

export default function PostEditor({ post, submitting, submitLabel, onSubmit }: PostEditorProps) {
	const { tags, createTag } = useTags();
	const {
		fileInputRef,
		uploadedImages,
		setUploadedImages,
		handleFileChange,
		removeImage,
		resetImages,
	} = useImageUpload();

	const [isPrivate, setIsPrivate] = useState(true);
	const [selectedTags, setSelectedTags] = useState<Tag[]>([]);
	const [showTagSelector, setShowTagSelector] = useState(false);

	const schema = useMemo(() => {
		const { video, audio, file, image, ...customBlockSpecs } = defaultBlockSpecs;
		return BlockNoteSchema.create({
			blockSpecs: {
				...customBlockSpecs,
			},
		});
	}, []);

	const editor = useCreateBlockNote({
		schema,
	});

	useEffect(() => {
		if (!post) return;
		setIsPrivate(post.accessLevel === AccessLevel.Private);
		setSelectedTags(post.tags?.tags ?? []);
		setUploadedImages(post.images ?? []);
	}, [post, setUploadedImages]);

	useEffect(() => {
		if (!editor) return;

		const initializeDocument = async () => {
			if (post?.content) {
				try {
					const blocks = await editor.tryParseMarkdownToBlocks(post.content);
					editor.replaceBlocks(editor.document, blocks);
					setTimeout(() => editor.focus(), EDITOR_INITIALIZED_DELAY_MS);
				} catch (error) {
					console.error("Failed to initialize editor:", error);
				}
			} else {
				editor.replaceBlocks(editor.document, []);
			}
		};

		initializeDocument();
	}, [editor, post?.content]);

	const handleToggleAccessLevel = useCallback(() => {
		setIsPrivate((prev) => !prev);
	}, []);

	const handleTagRemove = useCallback((tagId: string) => {
		setSelectedTags((prev) => prev.filter((tag) => tag.id !== tagId));
	}, []);

	const handleTagSelect = useCallback((tag: Tag) => {
		setSelectedTags((prev) => (prev.some((t) => t.id === tag.id) ? prev : [...prev, tag]));
	}, []);

	const handleSubmit = useCallback(async () => {
		if (!editor) return;

		try {
			const markdown = await editor.blocksToMarkdownLossy(editor.document);
			if (!markdown.trim()) {
				toast.error("コンテンツが空です");
				return;
			}

			const accessLevel = isPrivate ? AccessLevel.Private : AccessLevel.Public;
			const imageFileNames = uploadedImages.map((url) => {
				const parts = url.split("/");
				return parts[parts.length - 1] ?? url;
			});

			await onSubmit({
				content: markdown,
				accessLevel,
				images: imageFileNames,
				tagIds: selectedTags.map((tag) => tag.id),
			});
		} catch (error) {
			console.error("Post submission failed:", error);
			toast.error("Postの保存に失敗しました");
		}
	}, [editor, isPrivate, onSubmit, uploadedImages, selectedTags]);

	const handleReset = useCallback(() => {
		if (!editor) return;
		resetImages();
		setSelectedTags([]);
		setIsPrivate(true);
		editor.replaceBlocks(editor.document, []);
	}, [editor, resetImages]);

	return (
		<div className="space-y-4">
			<div className="flex flex-wrap items-center gap-2">
				<Button
					variant="outline"
					onClick={handleToggleAccessLevel}
					type="button"
					className={cn(
						"flex items-center gap-2",
						isPrivate ? "bg-destructive/70 text-white" : "bg-success/70 text-white",
					)}
				>
					{isPrivate ? <EyeOff size={16} /> : <Eye size={16} />}
					<span>{isPrivate ? "Private" : "Public"}</span>
				</Button>
				<Button variant="outline" type="button" onClick={() => fileInputRef.current?.click()}>
					<ImagePlus size={16} />
					<span className="ml-1">Images</span>
				</Button>
				<input
					ref={fileInputRef}
					type="file"
					accept="image/*"
					multiple
					onChange={handleFileChange}
					className="hidden"
				/>
				<Button variant="outline" type="button" onClick={() => setShowTagSelector((prev) => !prev)}>
					<Tags size={16} />
					<span className="ml-1">Tags</span>
				</Button>
				<Button variant="ghost" type="button" onClick={handleReset} disabled={submitting}>
					Reset
				</Button>
			</div>

			{uploadedImages.length > 0 ? (
				<div className="flex flex-wrap gap-3">
					{uploadedImages.map((imageUrl, index) => (
						<div key={imageUrl} className="relative">
							<img
								src={imageUrl}
								alt={`Uploaded ${index + 1}`}
								className="w-24 h-24 object-cover rounded"
							/>
							<button
								type="button"
								onClick={() => removeImage(index)}
								className="absolute -top-2 -right-2 bg-muted-foreground text-secondary rounded-full p-1"
								aria-label="Remove image"
							>
								X
							</button>
						</div>
					))}
				</div>
			) : null}

			{selectedTags.length > 0 ? (
				<div className="flex flex-wrap gap-2">
					{selectedTags.map((tag) => (
						<TagBadge key={tag.id} tag={tag} onRemove={handleTagRemove} />
					))}
				</div>
			) : null}

			{showTagSelector ? (
				<div className="border border-border rounded-lg p-4">
					<TagSelector
						availableTags={tags}
						selectedTags={selectedTags}
						onTagSelect={handleTagSelect}
						onTagRemove={handleTagRemove}
						onCreateTag={createTag}
						placeholder="タグを検索または作成"
					/>
				</div>
			) : null}

			<div className="border border-border rounded-lg overflow-hidden">
				<BlockNoteView editor={editor} className="min-h-[320px]" sideMenu={false} />
			</div>

			<div className="flex justify-end gap-3">
				<Button type="button" onClick={handleSubmit} disabled={submitting}>
					{submitting ? "Saving..." : submitLabel}
				</Button>
			</div>
		</div>
	);
}
