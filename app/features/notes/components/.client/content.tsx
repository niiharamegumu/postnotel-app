import { useCreateBlockNote } from "@blocknote/react";
import parse, { type HTMLReactParserOptions, type Element, type Text } from "html-react-parser";
import { useEffect, useState } from "react";
import { AccessLevel } from "~/constants/accessLevel";
import { highlightText } from "~/lib/textHighlight";
import type { Note } from "../../types/note";

type Props = {
	note: Note;
	searchQuery?: string;
};

export default function NoteContent({ note, searchQuery }: Props) {
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

	const applyHighlight = (text: string): React.ReactNode[] => {
		if (!searchQuery?.trim()) {
			return [text];
		}

		const matches = highlightText(text, searchQuery);
		return matches.map((match, index) =>
			match.isMatch ? (
				<mark
					key={`${text}-${index}-${match.text}`}
					className="bg-yellow-200 text-accent rounded px-0.5 font-semibold"
				>
					{match.text}
				</mark>
			) : (
				<span key={`${text}-${index}-${match.text}`}>{match.text}</span>
			),
		);
	};

	const getTextContent = (children: Element["children"]): string =>
		children?.map((child) => (child.type === "text" ? (child as Text).data : "")).join("") || "";

	const renderChildren = (children: Element["children"]) =>
		children?.map((child) => {
			if (child.type === "text") {
				return applyHighlight((child as Text).data);
			}
			return null;
		});

	const options: HTMLReactParserOptions = {
		replace: (domNode) => {
			if (domNode.type === "text") {
				const textNode = domNode as Text;
				return <>{applyHighlight(textNode.data)}</>;
			}

			if (domNode.type === "tag") {
				const element = domNode as Element;
				const { children, attribs } = element;

				if (element.name === "p") {
					const textContent = getTextContent(children);

					if (textContent === "\u200B") {
						return (
							<p className={`zero-space ${attribs?.class || ""}`}>{renderChildren(children)}</p>
						);
					}
				}

				if (element.name === "a" && attribs?.href) {
					const textContent = getTextContent(children) || attribs.href;

					return (
						<a
							href={attribs.href}
							target="_blank"
							rel="noopener noreferrer"
							onClick={(e) => e.stopPropagation()}
							className="text-blue-500 underline hover:text-blue-700"
						>
							{applyHighlight(textContent)}
						</a>
					);
				}
			}
		},
	};

	return (
		<div
			className={`px-4 py-2 whitespace-pre-line max-w-full ${
				note.accessLevel === AccessLevel.Private
					? "bg-secondary text-primary"
					: "bg-primary text-secondary"
			}`}
		>
			{html ? parse(html, options) : note.content}
		</div>
	);
}
