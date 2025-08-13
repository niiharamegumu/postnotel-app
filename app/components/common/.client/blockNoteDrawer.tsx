import { BlockNoteSchema, defaultBlockSpecs } from "@blocknote/core";
import { BlockNoteView } from "@blocknote/mantine";
import { useCreateBlockNote } from "@blocknote/react";
import { AnimatePresence, motion } from "framer-motion";
import { Eye, EyeOff, ImagePlus, Plus, Tags, Trash2, X } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { ApiResponseError } from "~/api/error/apiResponseError";
import { Button } from "~/components/ui/button";
import {
	Drawer,
	DrawerClose,
	DrawerContent,
	DrawerFooter,
	DrawerTrigger,
} from "~/components/ui/drawer";
import { AccessLevel } from "~/constants/accessLevel";
import { ActionType } from "~/features/notes/constants/actionType";
import { useNoteDraft } from "~/features/notes/hooks/useNoteDraft";
import { useNotes } from "~/features/notes/hooks/useNotes";
import type { Note, NoteApiRequest } from "~/features/notes/types/note";
import type { NoteDraft } from "~/features/notes/types/noteDraft";
import { TagBadge } from "~/features/tags/components/TagBadge";
import { TagSelector } from "~/features/tags/components/TagSelector";
import { useTags } from "~/features/tags/hooks/useTags";
import type { Tag } from "~/features/tags/types/tag";
import { useImageUpload } from "~/hooks/useImageUpload";
import { useMobileDevice } from "~/hooks/useMobileDevice";

type BlockNoteDrawerProps = {
	onSubmit: (params: NoteApiRequest) => Promise<void>;
	noteDrawerType: ActionType;
	setNoteDrawerType: React.Dispatch<React.SetStateAction<ActionType>>;
	loading: boolean;
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
	open,
	setOpen,
	targetDate,
	note,
}: BlockNoteDrawerProps) {
	const { deleteNote } = useNotes();
	const [isPrivate, setIsPrivate] = useState(true);
	const [selectedTags, setSelectedTags] = useState<Tag[]>([]);
	const [tagSelectorOpen, setTagSelectorOpen] = useState(false);
	const {
		fileInputRef,
		uploadedImages,
		setUploadedImages,
		handleFileChange,
		removeImage,
		resetImages,
	} = useImageUpload();
	const { tags, createTag } = useTags();
	const { isMobileDevice } = useMobileDevice();

	// BlockNoteの初期化
	const schema = useMemo(() => {
		const { video, audio, file, image, ...customBlockSpecs } = defaultBlockSpecs;
		return BlockNoteSchema.create({
			blockSpecs: {
				...customBlockSpecs,
			},
		});
	}, []);
	const editor = useCreateBlockNote({ schema });

	// SP用のタップハンドラー
	const handleContainerClick = useCallback(
		(event: React.MouseEvent<HTMLDivElement>) => {
			if (!isMobileDevice || !editor) return;

			// クリックされた要素がBlockNoteの編集可能エリア内でない場合のみ処理
			const target = event.target as HTMLElement;
			const isClickOnEditor = target.closest(".bn-editor") || target.closest("[contenteditable]");

			if (!isClickOnEditor) {
				try {
					// エディターにフォーカスを当てる
					editor.focus();

					// エディターが空の場合、カーソルが当たるようにする
					const blocks = editor.document;
					if (blocks.length > 0) {
						// 最初のブロックの開始位置にカーソルを設定
						const firstBlock = blocks[0];
						editor.setTextCursorPosition(firstBlock, "start");
					}
				} catch (error) {
					console.warn("Failed to focus editor:", error);
				}
			}
		},
		[editor, isMobileDevice],
	);

	const onDraftRestore = useCallback(
		(draft: NoteDraft) => {
			if (editor && draft.content) {
				editor.tryParseMarkdownToBlocks(draft.content).then((blocks) => {
					editor.replaceBlocks(editor.document, blocks);
				});
			}
		},
		[editor],
	);

	const noteDraft = useNoteDraft({
		targetDate,
		onDraftRestore,
	});

	const handleEditorChange = useCallback(async () => {
		if (noteDrawerType !== ActionType.Create) return;

		try {
			const markdown = await editor.blocksToMarkdownLossy(editor.document);
			const draftData = {
				content: markdown || "",
			};

			noteDraft.saveDraft(draftData);
		} catch (error) {
			console.warn("Failed to save draft:", error);
		}
	}, [editor, noteDrawerType, noteDraft]);

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
			// 正常保存時に下書きデータを削除
			noteDraft.clearDraft();
		} catch (e) {
			if (e instanceof ApiResponseError) {
				toast.error(e.message);
			} else {
				console.error(e);
			}
		} finally {
			resetDrawer();
		}
	};

	const handleDeleteNote = async () => {
		if (!note) return;

		const isConfirmed = window.confirm("このノートを削除しますか？");
		if (!isConfirmed || noteDrawerType !== ActionType.Edit) return;

		try {
			await deleteNote(note.noteId, targetDate);
			// 削除成功時に下書きデータも削除
			noteDraft.clearDraft();
			resetDrawer();
		} catch (error) {
			console.error("Failed to delete note:", error);
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
			<DrawerTrigger asChild>
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
			<DrawerContent className="px-4 !mt-0 !max-h-none !rounded-none h-[100dvh]">
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
				{selectedTags.length > 0 && (
					<div className="flex flex-wrap gap-2 py-2">
						{selectedTags.map((tag) => (
							<TagBadge key={tag.id} tag={tag} onRemove={onTagRemove} />
						))}
					</div>
				)}
				<div
					onClick={handleContainerClick}
					className="overflow-y-auto min-h-[200px] touch-manipulation"
				>
					<BlockNoteView
						editor={editor}
						className="h-full"
						onChange={noteDrawerType === ActionType.Create ? handleEditorChange : undefined}
					/>
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
										placeholder="タグを検索または作成"
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
							<Button variant="outline" type="button" onClick={handleDeleteNote} disabled={loading}>
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
