import { Link, type MetaFunction, useLoaderData, useOutletContext } from "react-router";
import { Button } from "~/components/ui/button";
import { fetchPostsWithPagination } from "~/features/posts/api/get";
import type { Post } from "~/features/posts/types/post";
import { calculateOffset, generatePageNumbers, getPageFromSearchParams } from "~/lib/pagination";
import type { PaginationInfo } from "~/lib/pagination";
import type { UserInfo } from "~/types/user";
import type { Route } from "./+types/new";

const POSTS_PAGE_SIZE = 10;

export const meta: MetaFunction = () => {
	return [{ title: "Posts - PostNotel" }, { name: "description", content: "PostNotel Posts" }];
};

export async function loader({ request, context }: Route.LoaderArgs) {
	const url = new URL(request.url);
	const page = getPageFromSearchParams(url.searchParams);
	const offset = calculateOffset(page, POSTS_PAGE_SIZE);

	const result = await fetchPostsWithPagination(request, context, {
		limit: POSTS_PAGE_SIZE,
		offset,
	});

	return Response.json({
		posts: result?.posts ?? [],
		paginationInfo: result?.paginationInfo ?? null,
		page,
	});
}

type LoaderData = {
	posts: Post[];
	paginationInfo: PaginationInfo | null;
	page: number;
};

const MAX_VISIBLE_PAGES = 5;
const CONTENT_PREVIEW_LENGTH = 160;

const getPostPreview = (content: string): string => {
	const stripped = content
		.replace(/```[\s\S]*?```/g, " ")
		.replace(/`([^`]+)`/g, " $1 ")
		.replace(/<[^>]+>/g, " ")
		.replace(/[#*_>\-]/g, " ")
		.replace(/\s+/g, " ")
		.trim();
	if (stripped.length <= CONTENT_PREVIEW_LENGTH) return stripped;
	return `${stripped.slice(0, CONTENT_PREVIEW_LENGTH)}…`;
};

export default function PostsIndex() {
	const { posts, paginationInfo, page } = useLoaderData<typeof loader>() as LoaderData;
	const userInfo = useOutletContext<UserInfo | null>();
	const pageNumbers = paginationInfo
		? generatePageNumbers(paginationInfo.currentPage, paginationInfo.totalPages, MAX_VISIBLE_PAGES)
		: [];

	return (
		<div className="max-w-3xl mx-auto space-y-6">
			<div className="flex justify-between items-center">
				<h1 className="text-2xl font-semibold">Posts</h1>
				{userInfo && (
					<Button asChild>
						<Link to="/posts/new">Create Post</Link>
					</Button>
				)}
			</div>
			{posts.length === 0 ? (
				<div className="text-muted-foreground">No posts yet.</div>
			) : (
				<ul className="space-y-4">
					{posts.map((post) => (
						<li
							key={post.noteId}
							className="border border-border rounded-lg p-4 bg-background shadow-sm"
						>
							<div className="flex justify-between items-center mb-2">
								<div className="text-sm text-muted-foreground">
									{new Date(post.updatedAt).toLocaleString("ja-JP")}
								</div>
								<div className="text-xs px-2 py-1 rounded-full bg-secondary text-secondary-foreground">
									{post.accessLevel}
								</div>
							</div>
							<Link to={`/posts/${post.noteId}`} className="block">
								<p className="text-base text-foreground leading-relaxed">
									{getPostPreview(post.content)}
								</p>
							</Link>
							{post.tags?.tags?.length ? (
								<div className="flex flex-wrap gap-2 mt-3">
									{post.tags.tags.map((tag) => (
										<span key={tag.id} className="text-xs bg-muted px-2 py-1 rounded">
											#{tag.name}
										</span>
									))}
								</div>
							) : null}
							{post.images?.length ? (
								<div className="flex gap-2 mt-3">
									{post.images.slice(0, 3).map((image) => (
										<img
											key={image}
											src={image}
											alt="Post preview"
											className="w-16 h-16 object-cover rounded"
										/>
									))}
								</div>
							) : null}
						</li>
					))}
				</ul>
			)}
			{paginationInfo && paginationInfo.totalPages > 1 ? (
				<nav className="flex items-center justify-between pt-6">
					<div className="text-sm text-muted-foreground">
						{paginationInfo.startItem} - {paginationInfo.endItem} / {paginationInfo.totalItems}
					</div>
					<div className="flex items-center gap-2">
						<Button variant="outline" disabled={!paginationInfo.hasPrevious} asChild>
							<Link
								to={`?page=${Math.max(1, page - 1)}`}
								aria-disabled={!paginationInfo.hasPrevious}
							>
								Prev
							</Link>
						</Button>
						{pageNumbers.map((pageNumber) => (
							<Button
								key={pageNumber}
								variant={pageNumber === page ? "default" : "outline"}
								asChild
							>
								<Link to={`?page=${pageNumber}`}>{pageNumber}</Link>
							</Button>
						))}
						<Button variant="outline" disabled={!paginationInfo.hasNext} asChild>
							<Link
								to={`?page=${Math.min(paginationInfo.totalPages, page + 1)}`}
								aria-disabled={!paginationInfo.hasNext}
							>
								Next
							</Link>
						</Button>
					</div>
				</nav>
			) : null}
		</div>
	);
}
