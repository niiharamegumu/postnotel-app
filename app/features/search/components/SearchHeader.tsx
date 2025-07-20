import { Search } from "lucide-react";

export function SearchHeader() {
	return (
		<div className="space-y-4">
			<div className="flex items-center gap-2">
				<Search size={26} color="#75b1ff" />
				<h1 className="text-3xl font-bold text-primary">Note Search</h1>
			</div>
		</div>
	);
}
