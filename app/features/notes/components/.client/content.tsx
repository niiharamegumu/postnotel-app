import { useCreateBlockNote } from "@blocknote/react";
import type { Note } from "../../types/note";
import parse from "html-react-parser";
import { AccessLevel } from "~/constants/accessLevel";

type Props = {
	note: Note;
};

export default async function NoteContent({ note }: Props) {
	const editor = useCreateBlockNote();
	const blocks = await editor.tryParseMarkdownToBlocks(note.content);
	const HTMLFromBlocks = await editor.blocksToFullHTML(blocks);

	return (
		<div
			className={`rounded-xl px-4 py-2 mb-1 whitespace-pre-line ${
				note.accessLevel === AccessLevel.Private
					? "bg-secondary text-primary"
					: "bg-primary text-secondary"
			}`}
		>
			{parse(HTMLFromBlocks)}
		</div>
	);
}
