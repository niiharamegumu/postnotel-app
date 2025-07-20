import { Search } from "lucide-react";
import { useCallback, useEffect } from "react";
import { useLocation, useNavigate, useSearchParams } from "react-router";
import { LoadingState } from "~/components/common/LoadingState";
import { useTextSearchDebounce } from "~/hooks/useTextSearchDebounce";
import { cn } from "~/lib/utils";
import { updateSearchUrl } from "../utils/searchUrlUtils";

type TextSearchInputProps = {
	className?: string;
	placeholder?: string;
	isLoading?: boolean;
};

export function TextSearchInput({
	className,
	placeholder = "ノートを検索...",
	isLoading = false,
}: TextSearchInputProps) {
	const navigate = useNavigate();
	const location = useLocation();
	const [searchParams] = useSearchParams();

	const handleSearch = useCallback(
		(query: string) => {
			const currentUrl = `${location.pathname}${location.search}`;
			const newUrl = updateSearchUrl(currentUrl, { q: query });
			navigate(newUrl);
		},
		[navigate, location.pathname, location.search],
	);

	const {
		query,
		setQuery,
		isComposing,
		handleInputChange,
		handleCompositionStart,
		handleCompositionEnd,
	} = useTextSearchDebounce({
		delay: 300,
		onSearch: handleSearch,
	});

	// Initialize query from URL params
	useEffect(() => {
		const qParam = searchParams.get("q");
		if (qParam && qParam !== query) {
			setQuery(qParam);
		}
	}, [searchParams, query, setQuery]);

	const handleInputChangeEvent = useCallback(
		(event: React.ChangeEvent<HTMLInputElement>) => {
			handleInputChange(event.target.value);
		},
		[handleInputChange],
	);

	const handleCompositionEndEvent = useCallback(
		(event: React.CompositionEvent<HTMLInputElement>) => {
			handleCompositionEnd(event.currentTarget.value);
		},
		[handleCompositionEnd],
	);

	return (
		<div className={cn("relative", className)}>
			<div className="relative">
				<Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
				<input
					type="text"
					value={query}
					onChange={handleInputChangeEvent}
					onCompositionStart={handleCompositionStart}
					onCompositionEnd={handleCompositionEndEvent}
					placeholder={placeholder}
					className={cn(
						"w-full pl-10 pr-10 py-2 text-sm",
						"border border-input rounded-md",
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
						<LoadingState variant="spinner" className="h-4 w-4" />
					</div>
				)}
			</div>
		</div>
	);
}
