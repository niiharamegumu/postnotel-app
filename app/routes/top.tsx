import type { Route } from "./+types/top";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "PostNotel" },
    { name: "description", content: "PostNotel Top" },
  ];
}

export default function Top() {
  return (
    <section>
      <h1>PostNotel</h1>
    </section>
  );
}
