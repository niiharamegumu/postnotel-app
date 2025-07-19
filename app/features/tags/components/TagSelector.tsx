import { Check, Plus } from "lucide-react";
import { useCallback, useMemo, useState } from "react";
import {
	Command,
	CommandEmpty,
	CommandGroup,
	CommandInput,
	CommandItem,
	CommandList,
} from "~/components/ui/command";
import { cn } from "~/lib/utils";
import { tagNameSchema } from "../schema/tag";
import type { Tag } from "../types/tag";

type TagSelectorProps = {
	availableTags: Tag[];
	selectedTags: Tag[];
	onTagSelect: (tag: Tag) => void;
	onTagRemove: (tagId: string) => void;
	onCreateTag?: (name: string) => Promise<Tag | null>;
	className?: string;
};

export function TagSelector({
	availableTags = [],
	selectedTags = [],
	onTagSelect,
	onTagRemove,
	onCreateTag,
	className,
}: TagSelectorProps) {
	const [inputValue, setInputValue] = useState("");

	const filteredTags = useMemo(
		() => availableTags.filter((tag) => tag.name.toLowerCase().includes(inputValue.toLowerCase())),
		[availableTags, inputValue],
	);

	const isTagSelected = useCallback(
		(tagId: string) => selectedTags.some((tag) => tag.id === tagId),
		[selectedTags],
	);

	const canCreateNewTag = useMemo(
		() =>
			onCreateTag && // onCreateTag関数が提供されていること
			inputValue.trim() !== "" && // 空でないこと
			!availableTags.some((tag) => tag.name.toLowerCase() === inputValue.toLowerCase()) && // 既存のタグと重複しないこと
			tagNameSchema.safeParse(inputValue).success, // スキーマに合致すること
		[onCreateTag, inputValue, availableTags],
	);

	const handleTagSelect = useCallback(
		(tag: Tag) => {
			if (isTagSelected(tag.id)) {
				onTagRemove(tag.id);
			} else {
				onTagSelect(tag);
			}
			setInputValue("");
		},
		[isTagSelected, onTagRemove, onTagSelect],
	);

	const handleCreateTag = useCallback(async () => {
		if (!canCreateNewTag || !onCreateTag) return;

		const newTag = await onCreateTag(inputValue.trim());
		if (newTag) {
			onTagSelect(newTag);
			setInputValue("");
		}
	}, [canCreateNewTag, onCreateTag, inputValue, onTagSelect]);

	return (
		<div className={cn("w-full space-y-2", className)}>
			<Command className="border rounded-lg">
				<CommandInput
					placeholder="タグを検索または作成..."
					value={inputValue}
					onValueChange={setInputValue}
					className="text-base"
					autoComplete="off"
					autoCorrect="off"
					spellCheck="false"
					autoCapitalize="none"
				/>
				<CommandList>
					<CommandEmpty>
						{inputValue.trim() === "" ? (
							"タグを入力してください"
						) : (
							<div className="p-2 text-sm text-muted-foreground">該当するタグがありません</div>
						)}
					</CommandEmpty>

					{filteredTags.length > 0 && (
						<CommandGroup heading="既存のタグ">
							{filteredTags.map((tag) => (
								<CommandItem
									key={tag.id}
									value={`tag-${tag.id}`}
									onSelect={() => handleTagSelect(tag)}
									className="cursor-pointer"
								>
									<Check
										className={cn(
											"mr-2 h-4 w-4",
											isTagSelected(tag.id) ? "opacity-100" : "opacity-0",
										)}
									/>
									{tag.name}
								</CommandItem>
							))}
						</CommandGroup>
					)}

					{canCreateNewTag && (
						<CommandGroup heading="新規作成">
							<CommandItem
								value={`create-${inputValue.trim()}`}
								onSelect={handleCreateTag}
								className="cursor-pointer"
							>
								<Plus className="mr-2 h-4 w-4" />
								新規作成: {inputValue.trim()}
							</CommandItem>
						</CommandGroup>
					)}
				</CommandList>
			</Command>
		</div>
	);
}
