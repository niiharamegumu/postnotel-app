import { useQueryState } from "nuqs";
import { useCallback } from "react";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "~/components/ui/select";
import { NoteContentType, noteContentTypeLabels } from "~/constants/noteContentType";
import { searchParamsParsers } from "../searchParams";

export function ContentTypeSelectionForm() {
	const [contentType, setContentType] = useQueryState(
		"contentType",
		searchParamsParsers.contentType.withOptions({ shallow: false }),
	);

	const handleContentTypeChange = useCallback(
		(value: string) => {
			const newContentType = value === "all" ? null : (value as NoteContentType);
			setContentType(newContentType);
		},
		[setContentType],
	);

	const contentTypeOptions = [
		{ value: "all", label: "すべてのコンテンツタイプ" },
		...Object.values(NoteContentType).map((contentType: NoteContentType) => ({
			value: contentType,
			label: noteContentTypeLabels[contentType],
		})),
	];

	const currentValue = contentType || "all";

	return (
		<div className="space-y-2">
			<Select value={currentValue} onValueChange={handleContentTypeChange}>
				<SelectTrigger className="w-full min-w-[250px] shadow-none rounded">
					<SelectValue />
				</SelectTrigger>
				<SelectContent>
					{contentTypeOptions.map((option) => (
						<SelectItem key={option.value} value={option.value}>
							{option.label}
						</SelectItem>
					))}
				</SelectContent>
			</Select>
		</div>
	);
}
