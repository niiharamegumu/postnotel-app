import "@blocknote/core/fonts/inter.css";
import "@blocknote/mantine/style.css";
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
import { useEffect, useState, useRef } from "react";
import { Eye, EyeOff, ImagePlus, Plus, Trash2, X } from "lucide-react";
import { BlockNoteSchema, defaultBlockSpecs } from "@blocknote/core";
import { AccessLevel } from "~/constants/accessLevel";
import { toast } from "sonner";
import type { Note, NoteApiRequest } from "~/features/notes/types/note";
import { ApiResponseError } from "~/api/error/apiResponseError";
import { ActionType } from "~/features/notes/constants/actionType";
import { useNavigate } from "react-router";
import { format } from "date-fns";

// TODO:型は移動させる
type UploadUrlResponse = {
	url: string;
	fileName: string;
	method: string;
	expires: number;
	storageBaseUrl: string;
};

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
	const navigate = useNavigate();
	const fileInputRef = useRef<HTMLInputElement>(null);
	// TODO: editのとき初期値が入らない問題を修正する
	const [uploadedImages, setUploadedImages] = useState<string[]>([]);

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
				} catch (error) {
					console.error("Failed to convert markdown to blocks:", error);
				}
			}
		};

		if (open) {
			initializeEditor();
		}
	}, [note, editor, noteDrawerType, open]);

	const resetDrawer = () => {
		setOpen(false);
		setNoteDrawerType(ActionType.Create);
		setIsPrivate(true);
		setUploadedImages([]); // 空の配列にリセット
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

	// 単一画像のアップロード処理
	const handleSingleImageUpload = async (file: File) => {
		try {
			// ファイル名から拡張子を取得
			const fileNameParts = file.name.split(".");
			const ext =
				fileNameParts.length > 1 ? fileNameParts[fileNameParts.length - 1].toLowerCase() : "";

			// Content-Typeを取得
			const contentType = file.type;

			// 画像アップロードURL取得（URLパラメータを追加）
			const getUrlResponse = await fetch(
				`/image/get-upload-url?ext=${encodeURIComponent(ext)}&contentType=${encodeURIComponent(contentType)}`,
			);

			if (!getUrlResponse.ok) {
				throw new Error("Failed to get upload URL");
			}

			const uploadData = (await getUrlResponse.json()) as UploadUrlResponse;

			// 画像アップロード
			const uploadResponse = await fetch(uploadData.url, {
				method: uploadData.method,
				headers: {
					"Content-Type": file.type,
				},
				body: file,
			});

			if (!uploadResponse.ok) {
				throw new Error("Failed to upload image");
			}

			const imageUrl = `${uploadData.storageBaseUrl}/temporary/${uploadData.fileName}`;

			// 画像URLを配列に追加
			setUploadedImages((prev) => [...prev, imageUrl]);

			return imageUrl;
		} catch (error) {
			console.error("Image upload failed:", error);
			toast.error("画像のアップロードに失敗しました");
			return null;
		}
	};

	// 複数画像アップロード処理
	const handleImageUpload = async (files: File[]) => {
		let successCount = 0;

		for (const file of files) {
			const result = await handleSingleImageUpload(file);
			if (result) successCount++;
		}

		if (successCount > 0) {
			toast.success(`${successCount}枚の画像をアップロードしました`);
		}
	};

	// ファイル選択時の処理
	const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
		// TODO: 画像の圧縮と拡張子変換を導入する
		const files = event.target.files;
		if (!files || files.length === 0) return;

		const validFiles: File[] = [];

		// 各ファイルを検証
		for (let i = 0; i < files.length; i++) {
			const file = files[i];
			if (!file.type.startsWith("image/")) {
				toast.error(`${file.name}は画像ファイルではありません`);
				continue;
			}
			validFiles.push(file);
		}

		// 有効なファイルがあればアップロード処理
		if (validFiles.length > 0) {
			handleImageUpload(validFiles);
		}

		// ファイル選択をリセット（同じファイルを再選択できるように）
		if (fileInputRef.current) {
			fileInputRef.current.value = "";
		}
	};

	// 特定の画像を削除する関数
	const removeImage = (index: number) => {
		setUploadedImages((prev) => prev.filter((_, i) => i !== index));
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
				<Button variant="secondary">
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
			<DrawerContent className="w-full h-[80vh] max-h-[80vh] px-4">
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
					<BlockNoteView editor={editor} className="py-4" />
				</div>
				<DrawerFooter className="flex items-center flex-row justify-between">
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
