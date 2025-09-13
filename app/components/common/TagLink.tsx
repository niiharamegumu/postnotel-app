import { Tag } from "lucide-react";
import { memo } from "react";
import { Link } from "react-router";

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
	const linkHref = href || `/notes/search?tagIds=${id}`;

	return (
		<Link to={linkHref} className="flex gap-1 items-center hover:underline whitespace-nowrap">
			<Tag size={size} color={color} />
			{name}
		</Link>
	);
});
