export function SectionPage({ title, body }: { title: string; body: string }) {
  return (
    <main className="mx-auto max-w-3xl ps-6 pe-6 py-16">
      <h1 className="font-serif text-4xl text-ink-900 text-start">{title}</h1>
      <p className="mt-6 text-ink-700 text-start">{body}</p>
    </main>
  );
}
