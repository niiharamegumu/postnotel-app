import { X } from "lucide-react";
import { Button } from "~/components/ui/button";
import type { Tag } from "../types/tag";

interface TagBadgeProps {
	tag: Tag;
	onRemove: (tagId: string) => void;
	removable?: boolean;
}

export function TagBadge({ tag, onRemove, removable = true }: TagBadgeProps) {
	return (
		<div className="inline-flex items-center gap-1 px-2 py-1 bg-secondary text-secondary-foreground rounded-md text-sm">
			<span>{tag.name}</span>
			{removable && (
				<Button
					variant="ghost"
					size="sm"
					className="h-4 w-4 p-0 hover:bg-secondary-foreground/10"
					onClick={() => onRemove(tag.id)}
				>
					<X className="h-3 w-3" />
				</Button>
			)}
		</div>
	);
}