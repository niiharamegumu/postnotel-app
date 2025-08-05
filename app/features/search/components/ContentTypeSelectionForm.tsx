import { useCallback } from "react";
import { useNavigate, useSearchParams } from "react-router";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "~/components/ui/select";
import { NoteContentType, noteContentTypeLabels } from "~/constants/noteContentType";
import { updateSearchParams } from "../utils/searchUrlUtils";

type ContentTypeSelectionFormProps = {
	selectedContentType?: NoteContentType;
};

export function ContentTypeSelectionForm({ selectedContentType }: ContentTypeSelectionFormProps) {
	const navigate = useNavigate();
	const [searchParams] = useSearchParams();

	const handleContentTypeChange = useCallback(
		(value: string) => {
			const contentType = value === "all" ? value : (value as NoteContentType);
			const newSearchParams = updateSearchParams(searchParams, { contentType });
			navigate(`/notes/search?${newSearchParams.toString()}`);
		},
		[searchParams, navigate],
	);

	const contentTypeOptions = [
		{ value: "all", label: "すべてのコンテンツタイプ" },
		...Object.values(NoteContentType).map((contentType: NoteContentType) => ({
			value: contentType,
			label: noteContentTypeLabels[contentType],
		})),
	];

	const currentValue = selectedContentType || "all";

	return (
		<div className="space-y-2">
			<Select value={currentValue} onValueChange={handleContentTypeChange}>
				<SelectTrigger className="w-full min-w-[250px]">
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
