"use client";
export default function ErrorPage({ reset }: { reset: () => void }) {
  return (
    <main className="empty">
      <h1>Etwas ist schiefgelaufen.</h1>
      <p>Bitte lade die Ansicht erneut.</p>
      <button className="button primary" onClick={reset}>
        Erneut versuchen
      </button>
    </main>
  );
}
