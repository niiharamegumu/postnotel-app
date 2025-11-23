import { Search } from "lucide-react";
import { useQueryState } from "nuqs";
import { useCallback, useEffect, useState } from "react";
import { LoadingState } from "~/components/common/LoadingState";
import { useTextSearchDebounce } from "~/hooks/useTextSearchDebounce";
import { cn } from "~/lib/utils";
import { searchParamsParsers } from "../searchParams";

type TextSearchInputProps = {
	className?: string;
	placeholder?: string;
	isLoading?: boolean;
};
export function TextSearchInput({
	className,
	placeholder = "テキスト検索",
	isLoading = false,
}: TextSearchInputProps) {
	const [query, setQuery] = useQueryState("q", searchParamsParsers.q.withOptions({ shallow: false }));
	const [inputValue, setInputValue] = useState<string>(query || "");

	const handleSearch = useCallback(
		(newQuery: string) => {
			setQuery(newQuery || null);
		},
		[setQuery],
	);

	const { isComposing, handleInputChange, handleCompositionStart, handleCompositionEnd } =
		useTextSearchDebounce({
			delay: 300,
			onSearch: handleSearch,
		});

	useEffect(() => {
		setInputValue(query || "");
	}, [query]);

	const handleInputChangeEvent = useCallback(
		(event: React.ChangeEvent<HTMLInputElement>) => {
			const value = event.target.value;
			setInputValue(value);
			handleInputChange(value);
		},
		[handleInputChange],
	);

	const handleCompositionEndEvent = useCallback(
		(event: React.CompositionEvent<HTMLInputElement>) => {
			const value = event.currentTarget.value;
			setInputValue(value);
			handleCompositionEnd(value);
		},
		[handleCompositionEnd],
	);

	return (
		<div className={cn("relative", className)}>
			<div className="relative">
				<Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
				<input
					type="text"
					value={inputValue}
					onChange={handleInputChangeEvent}
					onCompositionStart={handleCompositionStart}
					onCompositionEnd={handleCompositionEndEvent}
					placeholder={placeholder}
					className={cn(
						"w-full pl-10 pr-10 py-2 text-sm",
						"border border-input rounded",
						"bg-background text-foreground",
						"placeholder:text-muted-foreground",
						"focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
						"disabled:cursor-not-allowed disabled:opacity-50",
						"transition-colors",
					)}
					autoComplete="off"
					autoCorrect="off"
					spellCheck="false"
					autoCapitalize="none"
				/>
				{(isLoading || isComposing) && (
					<div className="absolute right-3 top-1/2 transform -translate-y-1/2">
						<LoadingState variant="spinner" size="sm" className="h-4 w-4" />
					</div>
				)}
			</div>
		</div>
	);
}
