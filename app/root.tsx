import {
	Links,
	Meta,
	Outlet,
	Scripts,
	ScrollRestoration,
	isRouteErrorResponse,
	useLoaderData,
} from "react-router";

import "@blocknote/core/fonts/inter.css";
import "@blocknote/mantine/style.css";
import type { Route } from "./+types/root";
import "./app.css";
import { Toaster } from "./components/ui/sonner";
import { endpoints } from "./constants/endpoints";
import { fetcher } from "./lib/fetcher";
import type { UserInfo } from "./types/user";

export const links: Route.LinksFunction = () => [
	{ rel: "preconnect", href: "https://fonts.googleapis.com" },
	{
		rel: "preconnect",
		href: "https://fonts.gstatic.com",
		crossOrigin: "anonymous",
	},
	{
		rel: "stylesheet",
		href: "https://fonts.googleapis.com/css2?family=Inter:ital,opsz,wght@0,14..32,100..900;1,14..32,100..900&display=swap",
	},
];

export function Layout({ children }: { children: React.ReactNode }) {
	return (
		<html lang="ja" className="dark">
			<head>
				<meta charSet="utf-8" />
				<meta
					name="viewport"
					content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no"
				/>
				<link rel="icon" href="/favicon.jpg" />
				<link rel="apple-touch-icon" href="/icon-180.png" />
				<Meta />
				<Links />
			</head>
			<body suppressHydrationWarning>
				{children}
				<ScrollRestoration />
				<Scripts />
			</body>
		</html>
	);
}

export async function loader({
	request,
	context,
}: Route.LoaderArgs): Promise<{ userInfo: UserInfo | null }> {
	try {
		const response = await fetcher(context, endpoints.users.me, {
			headers: {
				Cookie: request.headers.get("cookie") || "",
			},
		});

		if (!response.ok) return { userInfo: null };

		const data = await response.json();
		if (!data) return { userInfo: null };

		return { userInfo: data as UserInfo };
	} catch (error) {
		return { userInfo: null };
	}
}

export default function App() {
	const { userInfo } = useLoaderData<{ userInfo: UserInfo | null }>();
	return (
		<>
			<Toaster position="top-right" />
			<Outlet context={userInfo} />
		</>
	);
}

export function ErrorBoundary({ error }: Route.ErrorBoundaryProps) {
	let message = "Oops!";
	let details = "An unexpected error occurred.";
	let stack: string | undefined;

	if (isRouteErrorResponse(error)) {
		message = error.status === 404 ? "404" : "Error";
		details =
			error.status === 404 ? "The requested page could not be found." : error.statusText || details;
	} else if (import.meta.env.DEV && error && error instanceof Error) {
		details = error.message;
		stack = error.stack;
	}

	return (
		<main className="pt-16 p-4 container mx-auto">
			<h1>{message}</h1>
			<p>{details}</p>
			{stack && (
				<pre className="w-full p-4 overflow-x-auto">
					<code>{stack}</code>
				</pre>
			)}
		</main>
	);
}
