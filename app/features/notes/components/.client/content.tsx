import { useCreateBlockNote } from "@blocknote/react";
import { useEffect, useState } from "react";
import type { Note } from "../../types/note";
import parse, { type HTMLReactParserOptions, type Element, type Text } from "html-react-parser";
import { AccessLevel } from "~/constants/accessLevel";

type Props = {
	note: Note;
};

export default function NoteContent({ note }: Props) {
	const [html, setHtml] = useState<string>("");
	const editor = useCreateBlockNote();

	useEffect(() => {
		const processMarkdown = async () => {
			try {
				const blocks = await editor.tryParseMarkdownToBlocks(note.content);
				const HTMLFromBlocks = await editor.blocksToFullHTML(blocks);
				setHtml(HTMLFromBlocks);
			} catch (error) {
				console.error("Failed to process markdown:", error);
				setHtml(note.content);
			}
		};

		processMarkdown();
	}, [note.content, editor]);

	const options: HTMLReactParserOptions = {
		replace: (domNode) => {
			if (domNode.type === "tag" && domNode.name === "a") {
				const element = domNode as Element;
				const href = element.attribs?.href;
				const children = element.children;

				if (href) {
					return (
						<a
							href={href}
							target="_blank"
							rel="noopener noreferrer"
							onClick={(e) => e.stopPropagation()}
							className="text-blue-500 underline hover:text-blue-700"
						>
							{parse(
								children
									?.map((child) => (child.type === "text" ? (child as Text).data : ""))
									.join("") || href,
							)}
						</a>
					);
				}
			}
		},
	};

	return (
		<div
			className={`px-4 py-2 whitespace-pre-line ${
				note.accessLevel === AccessLevel.Private
					? "bg-secondary text-primary"
					: "bg-primary text-secondary"
			}`}
		>
			{html ? parse(html, options) : note.content}
		</div>
	);
}
