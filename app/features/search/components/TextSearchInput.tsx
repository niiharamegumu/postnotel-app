import { Search } from "lucide-react";
import { useCallback, useEffect, useRef } from "react";
import { useLocation, useNavigate, useSearchParams } from "react-router";
import { LoadingState } from "~/components/common/LoadingState";
import { useTextSearchDebounce } from "~/hooks/useTextSearchDebounce";
import { cn } from "~/lib/utils";

type TextSearchInputProps = {
	className?: string;
	placeholder?: string;
	isLoading?: boolean;
};

export function TextSearchInput({
	className,
	placeholder = "Search...",
	isLoading = false,
}: TextSearchInputProps) {
	const navigate = useNavigate();
	const location = useLocation();
	const [searchParams] = useSearchParams();
	const lastUrlQuery = useRef<string>("");

	const handleSearch = useCallback(
		(query: string) => {
			const newSearchParams = new URLSearchParams(location.search);

			if (query.trim()) {
				newSearchParams.set("q", query.trim());
			} else {
				newSearchParams.delete("q");
			}

			// Reset page when search changes
			newSearchParams.delete("page");

			const queryString = newSearchParams.toString();
			const newPath = queryString ? `${location.pathname}?${queryString}` : location.pathname;
			navigate(newPath);
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

	// Initialize from URL and sync when URL changes from other sources (not from this component)
	useEffect(() => {
		const urlQuery = searchParams.get("q") || "";
		if (urlQuery !== lastUrlQuery.current) {
			lastUrlQuery.current = urlQuery;
			setQuery(urlQuery);
		}
	}, [searchParams, setQuery]);

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
