import { StatusCodes } from "http-status-codes";
import { Suspense, lazy } from "react";
import { Link, type MetaFunction, useLoaderData, useOutletContext } from "react-router";
import ClientOnly from "~/components/common/ClientOnly";
import { Button } from "~/components/ui/button";
import { NoteContentType } from "~/constants/noteContentType";
import { fetchPostById } from "~/features/posts/api/get";
import type { Post } from "~/features/posts/types/post";
import type { UserInfo } from "~/types/user";
import type { Route } from "./+types/$postId";

const NoteContent = lazy(() => import("~/features/notes/components/.client/content"));

type LoaderData = {
	post: Post;
};

export const meta: MetaFunction = ({ data }) => {
	const loaderData = data as LoaderData | undefined;
	if (!loaderData?.post) {
		return [{ title: "Post Not Found - PostNotel" }];
	}

	const preview = loaderData.post.content.slice(0, 40).replace(/\s+/g, " ");
	return [{ title: `${preview} - PostNotel` }, { name: "description", content: preview }];
};

export async function loader({ request, context, params }: Route.LoaderArgs) {
	const { postId } = params;
	if (!postId) {
		throw new Response("Invalid post id", { status: StatusCodes.BAD_REQUEST });
	}

	const post = await fetchPostById(request, context, postId);

	if (!post || post.contentType !== NoteContentType.Post) {
		throw new Response("Post not found", { status: StatusCodes.NOT_FOUND });
	}

	return Response.json({ post });
}

export default function PostDetail() {
	const { post } = useLoaderData<LoaderData>();
	const userInfo = useOutletContext<UserInfo | null>();

	return (
		<div className="max-w-3xl mx-auto space-y-6">
			<div className="flex items-start justify-between gap-4">
				<div>
					<h1 className="text-2xl font-semibold">Post Detail</h1>
					<div className="text-sm text-muted-foreground">
						Updated {new Date(post.updatedAt).toLocaleString("ja-JP")}
					</div>
				</div>
				<div className="flex items-center gap-2">
					{userInfo ? (
						<Button asChild variant="outline">
							<Link to={`/posts/${post.noteId}/edit`}>記事を編集</Link>
						</Button>
					) : null}
					<Link to="/posts" className="text-sm text-primary underline">
						Back to list
					</Link>
				</div>
			</div>

			{post.images?.length ? (
				<div className="flex gap-2 flex-wrap">
					{post.images.map((image) => (
						<img key={image} src={image} alt="Post preview" className="w-24 h-24 object-cover rounded" />
					))}
				</div>
			) : null}

			<ClientOnly fallback={<div>Loading preview...</div>}>
				<Suspense fallback={<div>Loading preview...</div>}>
					<div className="border border-border rounded-lg p-4">
						<NoteContent note={post} />
					</div>
				</Suspense>
			</ClientOnly>
		</div>
	);
}
