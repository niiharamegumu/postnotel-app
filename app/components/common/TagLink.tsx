import { Link } from "react-router";
import { Tag } from "lucide-react";
import { memo } from "react";

type TagLinkProps = {
	id: string;
	name: string;
	size?: number;
	color?: string;
	href?: string;
};

export const TagLink = memo(function TagLink({
	id,
	name,
	size = 12,
	color = "#75b1ff",
	href,
}: TagLinkProps) {
	const linkHref = href || `/notes/tag/${id}`;

	return (
		<Link
			to={linkHref}
			className="flex gap-1 items-center hover:underline px-2 py-1 rounded transition-colors"
		>
			<Tag size={size} color={color} />
			{name}
		</Link>
	);
});
