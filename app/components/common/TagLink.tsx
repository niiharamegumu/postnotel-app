import { Link } from "react-router";
import { Tag } from "lucide-react";

type TagLinkProps = {
	id: string;
	name: string;
	size?: number;
	color?: string;
};

export function TagLink({ id, name, size = 12, color = "#75b1ff" }: TagLinkProps) {
	return (
		<Link to={`/notes/tag/${id}`} className="flex gap-1 items-center hover:underline">
			<Tag size={size} color={color} />
			{name}
		</Link>
	);
}
