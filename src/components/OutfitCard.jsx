import { useState } from 'react';
import { supabase } from '../lib/supabase.js';
import { deleteFromStorage } from '../lib/storage.js';
import Icon from './Icon.jsx';

export default function OutfitCard({ outfit, items, onDelete }) {
  const [deleting, setDeleting] = useState(false);
  const [err, setErr] = useState('');

  const used = (outfit.item_ids || [])
    .map((id) => items.find((i) => i.id === id))
    .filter(Boolean);

  async function handleDelete() {
    if (!confirm('Delete this outfit?')) return;
    setErr('');
    setDeleting(true);
    try {
      const { error } = await supabase.from('outfits').delete().eq('id', outfit.id);
      if (error) throw error;
      await deleteFromStorage('outfits', outfit.result_image_url);
      onDelete?.(outfit.id);
    } catch (e) {
      setErr(e.message || 'Could not delete.');
      setDeleting(false);
    }
  }

  return (
    <div className="relative overflow-hidden rounded-3xl bg-white shadow-soft">
      <div className="aspect-[3/4] w-full bg-cream-dark">
        <img
          src={outfit.result_image_url}
          alt="Saved outfit"
          className="h-full w-full object-cover"
          loading="lazy"
        />
      </div>
      <button
        type="button"
        onClick={handleDelete}
        disabled={deleting}
        className="absolute right-3 top-3 rounded-full bg-white/90 p-2 text-ink shadow-lift transition hover:bg-white hover:text-terracotta"
        aria-label="Delete outfit"
      >
        <Icon name="trash" className="h-4 w-4" />
      </button>
      <div className="space-y-2 p-3">
        <p className="text-[11px] uppercase tracking-[0.14em] text-ink-muted">
          {new Date(outfit.created_at).toLocaleDateString(undefined, {
            month: 'short',
            day: 'numeric',
          })}
        </p>
        {used.length > 0 ? (
          <div className="flex flex-wrap gap-1">
            {used.map((it) => (
              <span
                key={it.id}
                className="truncate rounded-full bg-cream-dark px-2.5 py-1 text-[11px] text-ink"
              >
                {it.name}
              </span>
            ))}
          </div>
        ) : (
          <p className="text-xs text-ink-muted">
            {outfit.item_ids?.length ?? 0} item(s) — some may have been deleted.
          </p>
        )}
        {err && <p className="text-xs text-terracotta">{err}</p>}
      </div>
    </div>
  );
}
