import { useEffect, useMemo, useState } from 'react';
import { supabase, CATEGORIES } from '../lib/supabase.js';
import TopBar from '../components/TopBar.jsx';
import ClothingCard from '../components/ClothingCard.jsx';
import AddItemSheet from '../components/AddItemSheet.jsx';
import LoadingSpinner from '../components/LoadingSpinner.jsx';
import ErrorBanner from '../components/ErrorBanner.jsx';
import Icon from '../components/Icon.jsx';

const THIRTY_DAYS_MS = 30 * 24 * 60 * 60 * 1000;

export default function Wardrobe() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState('');
  const [filter, setFilter] = useState('All');
  const [sheetOpen, setSheetOpen] = useState(false);

  useEffect(() => {
    load();
  }, []);

  async function load() {
    setLoading(true);
    setErr('');
    try {
      const { data, error } = await supabase
        .from('clothing_items')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      setItems(data || []);
    } catch (e) {
      setErr(e.message || 'Could not load wardrobe.');
    } finally {
      setLoading(false);
    }
  }

  const visible = useMemo(
    () => (filter === 'All' ? items : items.filter((i) => i.category === filter)),
    [items, filter],
  );

  const stats = useMemo(() => {
    const cutoff = Date.now() - THIRTY_DAYS_MS;
    const stale = items.filter((i) => {
      if (!i.last_worn) return true;
      const t = new Date(i.last_worn).getTime();
      return Number.isNaN(t) ? true : t < cutoff;
    }).length;
    return { total: items.length, stale };
  }, [items]);

  return (
    <>
      <TopBar
        eyebrow="Your closet"
        title="Wardrobe"
        subtitle={
          stats.total === 0
            ? 'Build your digital closet piece by piece.'
            : `${stats.total} pieces · ${stats.stale} haven't been worn lately`
        }
      />

      <ErrorBanner message={err} onDismiss={() => setErr('')} />

      {/* Filter chips */}
      <div className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-4 scroll-x-hide">
        {['All', ...CATEGORIES].map((c) => (
          <button
            key={c}
            type="button"
            onClick={() => setFilter(c)}
            className={filter === c ? 'chip-active' : 'chip-default'}
          >
            {c}
            {c === 'All' && items.length > 0 && (
              <span className="opacity-70">· {items.length}</span>
            )}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="pt-8 text-center">
          <LoadingSpinner label="Loading your closet…" />
        </div>
      ) : visible.length === 0 ? (
        <EmptyCloset isFirst={items.length === 0} filter={filter} onAdd={() => setSheetOpen(true)} />
      ) : (
        <div className="grid grid-cols-2 gap-3">
          {visible.map((item) => (
            <ClothingCard
              key={item.id}
              item={item}
              onChange={(updated) =>
                setItems((prev) => prev.map((i) => (i.id === updated.id ? updated : i)))
              }
              onDelete={(id) => setItems((prev) => prev.filter((i) => i.id !== id))}
            />
          ))}
        </div>
      )}

      {/* Floating add button */}
      <button
        type="button"
        onClick={() => setSheetOpen(true)}
        className="fixed right-5 bottom-safe z-10 flex h-14 w-14 items-center justify-center rounded-full bg-ink text-cream shadow-lift transition active:scale-95"
        style={{ bottom: 'calc(5.5rem + env(safe-area-inset-bottom))' }}
        aria-label="Add an item"
      >
        <Icon name="plus" className="h-6 w-6" strokeWidth={2} />
      </button>

      <AddItemSheet
        open={sheetOpen}
        onClose={() => setSheetOpen(false)}
        onAdded={(item) => setItems((prev) => [item, ...prev])}
      />
    </>
  );
}

function EmptyCloset({ isFirst, filter, onAdd }) {
  return (
    <div className="card flex flex-col items-center px-6 py-12 text-center">
      <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-cream-dark text-ink">
        <Icon name="hanger" className="h-7 w-7" />
      </div>
      <h3 className="font-serif text-2xl text-ink">
        {isFirst ? 'Your closet is empty' : `Nothing in ${filter}`}
      </h3>
      <p className="mt-1 text-sm text-ink-muted">
        {isFirst
          ? 'Start by adding a few favourite pieces.'
          : 'Add an item or pick another category.'}
      </p>
      <button type="button" onClick={onAdd} className="btn-primary mt-5">
        <Icon name="plus" className="h-4 w-4" strokeWidth={2.2} /> Add a piece
      </button>
    </div>
  );
}
