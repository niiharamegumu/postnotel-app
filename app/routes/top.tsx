export function meta() {
	return [{ title: "PostNotel" }, { name: "description", content: "PostNotel Top" }];
}

export default function Top() {
	return (
		<div className="max-w-2xl mx-auto py-8 space-y-10">
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
						<h3 className="text-lg font-semibold mb-2">Interests</h3>
						<p>Coffee, solo camping, cooking</p>
					</div>

					<div>
						<h3 className="text-lg font-semibold mb-2">Social</h3>
						<ul>
							<li>
								Twitter :
								<a
									href="https://twitter.com/megumu_niihara"
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
