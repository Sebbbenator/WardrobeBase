import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase.js';
import TopBar from '../components/TopBar.jsx';
import ClothingCard from '../components/ClothingCard.jsx';
import LoadingSpinner from '../components/LoadingSpinner.jsx';
import ErrorBanner from '../components/ErrorBanner.jsx';
import Icon from '../components/Icon.jsx';

const THIRTY_DAYS_MS = 30 * 24 * 60 * 60 * 1000;

export default function NotWornRecently() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState('');

  useEffect(() => {
    load();
  }, []);

  async function load() {
    setLoading(true);
    setErr('');
    try {
      const { data, error } = await supabase.from('clothing_items').select('*');
      if (error) throw error;
      const cutoff = Date.now() - THIRTY_DAYS_MS;
      const stale = (data || []).filter((i) => {
        if (!i.last_worn) return true;
        const t = new Date(i.last_worn).getTime();
        return Number.isNaN(t) ? true : t < cutoff;
      });
      stale.sort((a, b) => {
        if (!a.last_worn && !b.last_worn) return 0;
        if (!a.last_worn) return -1;
        if (!b.last_worn) return 1;
        return new Date(a.last_worn) - new Date(b.last_worn);
      });
      setItems(stale);
    } catch (e) {
      setErr(e.message || 'Could not load items.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <TopBar
        eyebrow="Gathering dust"
        title="Rediscover"
        subtitle="Pieces you haven't worn in 30+ days — give them another spin."
      />

      <ErrorBanner message={err} onDismiss={() => setErr('')} />

      {loading ? (
        <LoadingSpinner label="Checking your closet…" />
      ) : items.length === 0 ? (
        <div className="card flex flex-col items-center px-6 py-12 text-center">
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-sage-soft text-sage">
            <Icon name="check" className="h-7 w-7" strokeWidth={2.2} />
          </div>
          <h3 className="font-serif text-2xl text-ink">Nicely rotated</h3>
          <p className="mt-1 text-sm text-ink-muted">
            Everything's been worn in the last month.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3">
          {items.map((item) => (
            <ClothingCard
              key={item.id}
              item={item}
              onChange={(updated) =>
                setItems((prev) => {
                  if (
                    updated.last_worn &&
                    Date.now() - new Date(updated.last_worn).getTime() < THIRTY_DAYS_MS
                  ) {
                    return prev.filter((i) => i.id !== updated.id);
                  }
                  return prev.map((i) => (i.id === updated.id ? updated : i));
                })
              }
              onDelete={(id) => setItems((prev) => prev.filter((i) => i.id !== id))}
            />
          ))}
        </div>
      )}
    </>
  );
}
