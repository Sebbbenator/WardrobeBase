import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase.js';
import TopBar from '../components/TopBar.jsx';
import OutfitCard from '../components/OutfitCard.jsx';
import LoadingSpinner from '../components/LoadingSpinner.jsx';
import ErrorBanner from '../components/ErrorBanner.jsx';
import Icon from '../components/Icon.jsx';
import { useNavigate } from 'react-router-dom';

export default function MyOutfits() {
  const [outfits, setOutfits] = useState([]);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    load();
  }, []);

  async function load() {
    setLoading(true);
    setErr('');
    try {
      const [oRes, iRes] = await Promise.all([
        supabase.from('outfits').select('*').order('created_at', { ascending: false }),
        supabase.from('clothing_items').select('id, name, category'),
      ]);
      if (oRes.error) throw oRes.error;
      if (iRes.error) throw iRes.error;
      setOutfits(oRes.data || []);
      setItems(iRes.data || []);
    } catch (e) {
      setErr(e.message || 'Could not load outfits.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <TopBar
        eyebrow="Lookbook"
        title="My outfits"
        subtitle={
          outfits.length === 0
            ? 'Saved looks will live here.'
            : `${outfits.length} saved ${outfits.length === 1 ? 'look' : 'looks'}`
        }
      />

      <ErrorBanner message={err} onDismiss={() => setErr('')} />

      {loading ? (
        <LoadingSpinner label="Loading outfits…" />
      ) : outfits.length === 0 ? (
        <div className="card flex flex-col items-center px-6 py-12 text-center">
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-cream-dark text-ink">
            <Icon name="sparkles" className="h-7 w-7" />
          </div>
          <h3 className="font-serif text-2xl text-ink">No looks yet</h3>
          <p className="mt-1 text-sm text-ink-muted">
            Head to the Build tab and try on your first outfit.
          </p>
          <button
            type="button"
            onClick={() => navigate('/builder')}
            className="btn-primary mt-5"
          >
            <Icon name="wand" className="h-4 w-4" /> Build a look
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3">
          {outfits.map((o) => (
            <OutfitCard
              key={o.id}
              outfit={o}
              items={items}
              onDelete={(id) => setOutfits((prev) => prev.filter((x) => x.id !== id))}
            />
          ))}
        </div>
      )}
    </>
  );
}
