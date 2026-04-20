import { useState } from 'react';
import { getReplicateKey, setReplicateKey } from '../lib/replicate.js';
import TopBar from '../components/TopBar.jsx';
import Icon from '../components/Icon.jsx';

export default function Settings() {
  const [key, setKey] = useState(getReplicateKey());
  const [savedMsg, setSavedMsg] = useState('');
  const [show, setShow] = useState(false);

  function handleSave(e) {
    e.preventDefault();
    setReplicateKey(key);
    setSavedMsg(key ? 'Saved.' : 'Cleared.');
    setTimeout(() => setSavedMsg(''), 2000);
  }

  function handleClear() {
    setReplicateKey('');
    setKey('');
    setSavedMsg('Cleared.');
    setTimeout(() => setSavedMsg(''), 2000);
  }

  return (
    <>
      <TopBar eyebrow="Preferences" title="Settings" />

      <div className="space-y-5">
        <form onSubmit={handleSave} className="card space-y-4 p-5">
          <div>
            <h2 className="font-serif text-xl text-ink">Replicate</h2>
            <p className="mt-1 text-sm text-ink-muted">
              The key stays on this device. Needed for AI try-on.
            </p>
          </div>

          <div>
            <label className="label" htmlFor="replicate-key">API key</label>
            <div className="flex gap-2">
              <input
                id="replicate-key"
                className="input flex-1"
                type={show ? 'text' : 'password'}
                autoComplete="off"
                placeholder="r8_..."
                value={key}
                onChange={(e) => setKey(e.target.value)}
              />
              <button
                type="button"
                onClick={() => setShow((s) => !s)}
                className="btn-icon"
                aria-label={show ? 'Hide key' : 'Show key'}
              >
                <Icon name={show ? 'eyeOff' : 'eye'} />
              </button>
            </div>
            <p className="mt-2 text-xs text-ink-muted">
              Get a key at{' '}
              <a
                href="https://replicate.com/account/api-tokens"
                target="_blank"
                rel="noreferrer"
                className="text-ink underline underline-offset-2"
              >
                replicate.com/account/api-tokens
              </a>
              .
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button type="submit" className="btn-primary">Save</button>
            <button type="button" onClick={handleClear} className="btn-ghost">
              Clear
            </button>
            {savedMsg && <span className="text-sm text-sage">{savedMsg}</span>}
          </div>
        </form>

        <section className="card space-y-2 p-5">
          <h2 className="font-serif text-xl text-ink">Supabase</h2>
          <p className="text-sm text-ink-muted">
            Supabase URL and anon key are read from your{' '}
            <code className="rounded bg-cream-dark px-1.5 py-0.5 text-[12px] text-ink">.env</code>{' '}
            file. Restart the dev server after editing.
          </p>
        </section>

        <section className="card space-y-2 p-5">
          <h2 className="font-serif text-xl text-ink">Install app</h2>
          <p className="text-sm text-ink-muted">
            On iPhone: tap Share → <em>Add to Home Screen</em>. On Android Chrome: menu → <em>Install app</em>. It'll open full-screen like a native app.
          </p>
        </section>

        <p className="pt-2 text-center text-xs text-ink-muted">
          WardrobeBase · v0.1
        </p>
      </div>
    </>
  );
}
