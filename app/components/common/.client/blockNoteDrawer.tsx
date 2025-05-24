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
import { Toggle } from "~/components/ui/toggle";
import { AccessLevel, accessLevelLabels } from "~/constants/accessLevel";
import { toast } from "sonner";

type BlockNoteDrawerProps = {
	onSubmit: (params: {
		content: string;
		accessLevel: AccessLevel;
	}) => Promise<void>;
	buttonLabel?: string;
};

export default function BlockNoteDrawer({
	onSubmit,
	buttonLabel = "Submit",
}: BlockNoteDrawerProps) {
	const [loading, setLoading] = useState(false);
	const [open, setOpen] = useState(false);
	const [isPrivate, setIsPrivate] = useState(true);

	// BlockNoteの初期化
	const { video, audio, file, ...customBlockSpecs } = defaultBlockSpecs;
	const schema = BlockNoteSchema.create({
		blockSpecs: {
			...customBlockSpecs,
		},
	});
	const editor = useCreateBlockNote({ schema });

	// BlockNoteをMarkdownに変換してHandlerを呼び出す
	const handleSubmit = async () => {
		setLoading(true);
		try {
			const markdown = await editor.blocksToMarkdownLossy(editor.document);
			const accessLevel = isPrivate ? AccessLevel.Private : AccessLevel.Public;
			await onSubmit({
				content: markdown,
				accessLevel,
			});
		} catch (e) {
			if (e instanceof ApiResponseError) {
				toast.error(e.message);
			} else {
				console.error(e);
			}
		} finally {
			setOpen(false);
			setLoading(false);
			editor.replaceBlocks(editor.document, []);
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
							{loading ? `${buttonLabel}...` : buttonLabel}
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
