import { useEffect, useState } from 'react';
import { STEPS } from './steps.js';

// shortcut: hash-based switching instead of a router; swap in a router when real pages land.
const currentPath = () => location.hash.replace(/^#\/?/, '');

export default function App() {
  const [path, setPath] = useState(currentPath);

  useEffect(() => {
    const onChange = () => setPath(currentPath());
    addEventListener('hashchange', onChange);
    return () => removeEventListener('hashchange', onChange);
  }, []);

  const step = STEPS.find((s) => s.path === path);

  return (
    <main>
      <h1>Mang Juan</h1>
      {step ? (
        <section>
          <h2>{step.title}</h2>
          <p>Placeholder for {step.story}.</p>
          <a href="#/">Back to all steps</a>
        </section>
      ) : (
        <nav aria-label="Happy path">
          <ol>
            {STEPS.map((s) => (
              <li key={s.path}>
                <a href={`#/${s.path}`}>{s.title}</a>
              </li>
            ))}
          </ol>
        </nav>
      )}
    </main>
  );
}
