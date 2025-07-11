import { BlockNoteView } from "@blocknote/mantine";
import { useCreateBlockNote } from "@blocknote/react";
import {
	Drawer,
	DrawerClose,
	DrawerContent,
	DrawerFooter,
	DrawerTrigger,
} from "~/components/ui/drawer";
import { Button } from "~/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";
import { Eye, EyeOff, ImagePlus, Plus, Tags, Trash2, X } from "lucide-react";
import { BlockNoteSchema, defaultBlockSpecs } from "@blocknote/core";
import { AccessLevel } from "~/constants/accessLevel";
import { toast } from "sonner";
import type { Note, NoteApiRequest } from "~/features/notes/types/note";
import { ApiResponseError } from "~/api/error/apiResponseError";
import { ActionType } from "~/features/notes/constants/actionType";
import { useNavigate } from "react-router";
import { format } from "date-fns";
import { useImageUpload } from "~/hooks/useImageUpload";
import { TagSelector } from "~/features/tags/components/TagSelector";
import { useTags } from "~/features/tags/hooks/useTags";
import type { Tag } from "~/features/tags/types/tag";
import { TagBadge } from "~/features/tags/components/TagBadge";

type BlockNoteDrawerProps = {
	onSubmit: (params: NoteApiRequest) => Promise<void>;
	noteDrawerType: ActionType;
	setNoteDrawerType: React.Dispatch<React.SetStateAction<ActionType>>;
	loading: boolean;
	setLoading: React.Dispatch<React.SetStateAction<boolean>>;
	open: boolean;
	setOpen: React.Dispatch<React.SetStateAction<boolean>>;
	note: Note | null;
	targetDate: Date;
};

export default function BlockNoteDrawer({
	onSubmit,
	noteDrawerType,
	setNoteDrawerType,
	loading,
	setLoading,
	open,
	setOpen,
	targetDate,
	note,
}: BlockNoteDrawerProps) {
	const [isPrivate, setIsPrivate] = useState(true);
	const [selectedTags, setSelectedTags] = useState<Tag[]>([]);
	const [tagSelectorOpen, setTagSelectorOpen] = useState(false);
	const navigate = useNavigate();
	const {
		fileInputRef,
		uploadedImages,
		setUploadedImages,
		handleFileChange,
		removeImage,
		resetImages,
	} = useImageUpload();
	const { tags, createTag } = useTags();

	// BlockNoteの初期化
	const { video, audio, file, image, ...customBlockSpecs } = defaultBlockSpecs;
	const schema = BlockNoteSchema.create({
		blockSpecs: {
			...customBlockSpecs,
		},
	});
	const editor = useCreateBlockNote({ schema });
	useEffect(() => {
		const initializeEditor = async () => {
			if (note?.content && noteDrawerType === ActionType.Edit && editor) {
				try {
					const blocks = await editor.tryParseMarkdownToBlocks(note.content);
					editor.replaceBlocks(editor.document, blocks);
					setIsPrivate(note.accessLevel === AccessLevel.Private);

					setUploadedImages(note.images);

					// タグの設定
					if (note.tags?.tags) {
						setSelectedTags(note.tags.tags);
					}
				} catch (error) {
					console.error("Failed to convert markdown to blocks:", error);
				}
			}
		};

		if (open) {
			initializeEditor();
		}
	}, [note, editor, noteDrawerType, open, setUploadedImages]);

	const resetDrawer = () => {
		setOpen(false);
		setNoteDrawerType(ActionType.Create);
		setIsPrivate(true);
		setSelectedTags([]);
		setTagSelectorOpen(false);
		resetImages();
		editor.replaceBlocks(editor.document, []);
	};

	// BlockNoteをMarkdownに変換してHandlerを呼び出す
	const handleSubmit = async () => {
		setLoading(true);
		try {
			const markdown = await editor.blocksToMarkdownLossy(editor.document);
			if (!markdown) {
				toast.error("ノートの内容が空です。");
				return;
			}
			const accessLevel = isPrivate ? AccessLevel.Private : AccessLevel.Public;
			const imagesFileNames = uploadedImages.map((url) => {
				const parts = url.split("/");
				return parts[parts.length - 1];
			});
			await onSubmit({
				content: markdown,
				accessLevel,
				images: imagesFileNames,
				tagIds: selectedTags.map((tag) => tag.id),
			});
		} catch (e) {
			if (e instanceof ApiResponseError) {
				toast.error(e.message);
			} else {
				console.error(e);
			}
		} finally {
			setLoading(false);
			resetDrawer();
		}
	};

	const deleteNote = async () => {
		if (!note) return;

		const isConfirmed = window.confirm("このノートを削除しますか？");
		if (!isConfirmed || noteDrawerType !== ActionType.Edit) return;

		setLoading(true);
		try {
			const res = await fetch(`/notes/${note.noteId}/delete`, {
				method: "POST",
			});
			if (!res.ok) throw new ApiResponseError(res.status, "ノートの削除に失敗しました");

			navigate(`/notes?date=${format(targetDate, "yyyy-MM-dd")}`);
			toast.success("ノートを削除しました");
		} catch (error) {
			if (error instanceof ApiResponseError) {
				toast.error(error.message);
			} else {
				console.error("Failed to delete note:", error);
			}
		} finally {
			setLoading(false);
			resetDrawer();
		}
	};

	const onTagRemove = (tagId: string) => {
		setSelectedTags((prev) => prev.filter((tag) => tag.id !== tagId));
	};

	return (
		<Drawer
			open={open}
			onOpenChange={(isOpen) => {
				if (!isOpen) {
					resetDrawer();
				}
				setOpen(isOpen);
			}}
		>
			<DrawerTrigger>
				<Button className="border-solid border-secondary border-1">
					<AnimatePresence mode="wait" initial={false}>
						<motion.span
							key={open ? "close" : "plus"}
							initial={{ opacity: 0, scale: 0.7 }}
							animate={{ opacity: 1, scale: 1 }}
							exit={{ opacity: 0, scale: 0.7 }}
							transition={{ duration: 0.18, ease: "easeInOut" }}
						>
							{open ? <X /> : <Plus />}
						</motion.span>
					</AnimatePresence>
				</Button>
			</DrawerTrigger>
			<DrawerContent className="px-4 h-max-[100svh]">
				{uploadedImages.length > 0 && (
					<div className="w-full p-2 flex justify-start flex-wrap items-center gap-2">
						{uploadedImages.map((imageUrl, index) => (
							<div key={imageUrl} className="border border-muted-foreground rounded p-1 relative">
								<img
									src={imageUrl}
									alt={`Uploaded ${index + 1}`}
									className="max-w-[60px] max-h-[60px] object-cover rounded"
								/>
								<button
									type="button"
									onClick={() => removeImage(index)}
									className="absolute -top-2 -right-2 text-secondary rounded-full p-1 bg-muted-foreground"
									aria-label="Remove image"
								>
									<X size={14} />
								</button>
							</div>
						))}
					</div>
				)}
				<div className="h-full overflow-y-auto">
					{selectedTags.length > 0 && (
						<div className="flex flex-wrap gap-2 mt-4 mb-2">
							{selectedTags.map((tag) => (
								<TagBadge key={tag.id} tag={tag} onRemove={onTagRemove} />
							))}
						</div>
					)}
					<BlockNoteView editor={editor} className="py-4" />
				</div>
				<DrawerFooter className="flex items-center flex-col px-0 md:flex-row md:justify-center md:gap-4">
					<div className="flex items-center gap-2">
						<Button variant="outline" onClick={() => setIsPrivate(!isPrivate)} type="button">
							{isPrivate ? <EyeOff /> : <Eye />}
						</Button>
						<Button variant="outline" type="button" onClick={() => fileInputRef.current?.click()}>
							<ImagePlus />
						</Button>
						<input
							ref={fileInputRef}
							type="file"
							accept="image/*"
							multiple
							onChange={handleFileChange}
							className="hidden"
						/>
						<Drawer open={tagSelectorOpen} onOpenChange={setTagSelectorOpen}>
							<DrawerTrigger asChild>
								<Button variant="outline" type="button">
									<Tags />
								</Button>
							</DrawerTrigger>
							<DrawerContent className="w-full max-h-[60vh] px-4">
								<h3 className="text-lg font-semibold mb-2">Select Tags</h3>
								{selectedTags.length > 0 && (
									<div className="flex flex-wrap gap-2 mb-2">
										{selectedTags.map((tag) => (
											<TagBadge key={tag.id} tag={tag} onRemove={onTagRemove} />
										))}
									</div>
								)}
								<div className="overflow-y-auto">
									<TagSelector
										availableTags={tags}
										selectedTags={selectedTags}
										onTagSelect={(tag) =>
											setSelectedTags((prev) => {
												// 重複チェック
												if (prev.some((t) => t.id === tag.id)) {
													return prev;
												}
												return [...prev, tag];
											})
										}
										onTagRemove={onTagRemove}
										onCreateTag={createTag}
									/>
								</div>
								<DrawerFooter className="px-0 py-2">
									<DrawerClose asChild>
										<Button variant="outline">Close</Button>
									</DrawerClose>
								</DrawerFooter>
							</DrawerContent>
						</Drawer>
						{noteDrawerType === ActionType.Edit && (
							<Button variant="outline" type="button" onClick={deleteNote} disabled={loading}>
								<Trash2 />
							</Button>
						)}
					</div>
					<div className="flex items-center gap-2">
						<Button variant="default" onClick={handleSubmit} disabled={loading}>
							{loading ? `${noteDrawerType}...` : noteDrawerType}
						</Button>
						<DrawerClose>
							<Button variant="outline">Cancel</Button>
						</DrawerClose>
					</div>
				</DrawerFooter>
			</DrawerContent>
		</Drawer>
	);
}
