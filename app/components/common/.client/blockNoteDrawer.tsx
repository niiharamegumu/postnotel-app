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
import { useState } from "react";
import { Plus, X } from "lucide-react";
import { BlockNoteSchema, defaultBlockSpecs } from "@blocknote/core";
import { useNavigate, useSearchParams } from "react-router";
import { format } from "date-fns";
import { Toggle } from "~/components/ui/toggle";
import { AccessLevel, accessLevelLabels } from "~/constants/accessLevel";
import { toast } from "sonner";

export default function BlockNoteDrawer() {
	const [loading, setLoading] = useState(false);
	const [open, setOpen] = useState(false);
	const [isPrivate, setIsPrivate] = useState(true);
	const [searchParams] = useSearchParams();
	const navigate = useNavigate();

	// BlockNoteの初期化
	const { video, audio, file, ...customBlockSpecs } = defaultBlockSpecs;
	const schema = BlockNoteSchema.create({
		blockSpecs: {
			...customBlockSpecs,
		},
	});
	const editor = useCreateBlockNote({ schema });

	// 登録対象の日付を取得
	const date = searchParams.get("date");
	const targetDate = date ? new Date(date) : new Date();

	// BlockNoteをMarkdownに変換して送信する
	const handleSubmit = async () => {
		setLoading(true);
		try {
			const markdown = await editor.blocksToMarkdownLossy(editor.document);
			const body = JSON.stringify({
				content: markdown,
				accessLevel: isPrivate ? AccessLevel.Private : AccessLevel.Public,
				noteDay: format(targetDate, "yyyy-MM-dd"),
			});
			const res = await fetch("/notes/create", {
				method: "POST",
				body,
			});
			if (!res.ok) {
				toast.error("ノートの作成に失敗しました");
				return;
			}
			setOpen(false);
			editor.replaceBlocks(editor.document, []);
			navigate(`/notes?date=${format(targetDate, "yyyy-MM-dd")}`);
			toast.success("ノートを作成しました");
		} catch (e) {
			console.error(e);
			toast.error("ノートの作成に失敗しました");
		} finally {
			setLoading(false);
		}
	};

	return (
		<Drawer open={open} onOpenChange={setOpen}>
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
				<BlockNoteView editor={editor} className="py-4" />
				<DrawerFooter className="flex items-center flex-row justify-between">
					<Toggle variant="outline" onClick={() => setIsPrivate(!isPrivate)}>
						{isPrivate
							? accessLevelLabels[AccessLevel.Private]
							: accessLevelLabels[AccessLevel.Public]}
					</Toggle>
					<div className="flex items-center gap-2">
						<Button variant="default" onClick={handleSubmit} disabled={loading}>
							{loading ? "Submitting..." : "Submit"}
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
