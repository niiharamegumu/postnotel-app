export function meta() {
	return [{ title: "PostNotel" }, { name: "description", content: "PostNotel Top" }];
}

export default function Top() {
	return (
		<div className="max-w-2xl mx-auto py-8 space-y-10 px-4">
			<section>
				<h1 className="flex items-center gap-4 text-3xl font-bold">
					<img
						src="/favicon.jpg"
						alt="PostNotel Logo"
						width={50}
						height={50}
						className="rounded-md"
					/>
					PostNotel
				</h1>
			</section>
			<section>
				<h2 className="text-2xl font-bold mb-6">Megumu Niihara</h2>
				<div className="space-y-6">
					<div>
						<p>
							A web engineer based in Miyazaki City, Miyazaki Prefecture, Japan. Born and raised
							locally, I’m seeking sustainable ways to live and work in my hometown.
						</p>
					</div>

					<div>
						<h3 className="text-lg font-semibold mb-2">Skills</h3>
						<p>
							HTML, CSS, JavaScript, TypeScript, jQuery, React, Next.js, Remix, Laravel, PHP, Go,
							Docker, AWS, GCP, Cloudflare
						</p>
					</div>

					<div>
						<h3 className="text-lg font-semibold mb-2">Experience</h3>
						<p>
							Currently working as an engineer at IJGN Group Inc. Previously held positions at
							Libertyship as a front-end lead and Aratana as a backend engineer.
						</p>
					</div>

				<div>
					<h3 className="text-lg font-semibold mb-2">This Site</h3>
					<div className="space-y-4">
						<div>
							<h4 className="font-semibold">Frontend</h4>
							<ul className="list-disc list-inside text-sm space-y-1">
								<li>React Router v7 (SSR) + React 19 with TypeScript</li>
								<li>Tailwind CSS v4, Radix UI primitives, BlockNote editor</li>
								<li>Framer Motion, date-fns, Sonner for UX polish</li>
							</ul>
						</div>
						<div>
							<h4 className="font-semibold">Backend For Frontend</h4>
							<ul className="list-disc list-inside text-sm space-y-1">
								<li>Cloudflare Workers runtime handling SSR and `/api/*` BFF routes</li>
								<li>React Router loaders/actions + fetcher utilities bridging to REST API</li>
								<li>Cloudflare R2 integrations for media delivery</li>
							</ul>
						</div>
						<div>
							<h4 className="font-semibold">Backend (REST API)</h4>
							<ul className="list-disc list-inside text-sm space-y-1">
								<li>Go + Gin framework exposing `/v1` endpoints</li>
								<li>Session-based Google OAuth auth, note/tag/image services</li>
								<li>Pagination-rich responses optimized for BFF consumers</li>
							</ul>
						</div>
						<div>
							<h4 className="font-semibold">Tooling</h4>
							<ul className="list-disc list-inside text-sm space-y-1">
								<li>React Hook Form + Zod validation pipeline</li>
								<li>Vite build orchestrated via Wrangler deploys</li>
								<li>Biome formatting/linting for TypeScript stack</li>
							</ul>
						</div>
					</div>
				</div>

					<div>
						<h3 className="text-lg font-semibold mb-2">Interests</h3>
						<p>Coffee, solo camping, cooking</p>
					</div>

					<div>
						<h3 className="text-lg font-semibold mb-2">Social</h3>
						<ul>
							<li>
								Twitter :
								<a
									href="https://x.com/megumu_me"
									target="_blank"
									rel="noopener noreferrer"
									className="ml-1"
								>
									https://x.com/megumu_me
								</a>
							</li>
							<li>
								GitHub :
								<a
									href="https://github.com/niiharamegumu"
									target="_blank"
									rel="noopener noreferrer"
									className="ml-1"
								>
									https://github.com/niiharamegumu
								</a>
							</li>
							<li>
								My Old Personal Website :
								<a
									href="https://megumu.me/"
									target="_blank"
									rel="noopener noreferrer"
									className="ml-1"
								>
									https://megumu.me/
								</a>
							</li>
						</ul>
					</div>
				</div>
			</section>
		</div>
	);
}
