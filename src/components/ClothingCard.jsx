import { useState } from 'react';
import { supabase } from '../lib/supabase.js';
import { deleteFromStorage } from '../lib/storage.js';
import Icon from './Icon.jsx';

function daysSince(dateStr) {
  if (!dateStr) return null;
  const d = new Date(dateStr);
  if (Number.isNaN(d.getTime())) return null;
  return Math.floor((Date.now() - d.getTime()) / (1000 * 60 * 60 * 24));
}

function formatWorn(dateStr) {
  const days = daysSince(dateStr);
  if (days === null) return 'Never worn';
  if (days === 0) return 'Worn today';
  if (days === 1) return '1 day ago';
  if (days < 30) return `${days} days ago`;
  if (days < 60) return 'A month ago';
  return `${Math.floor(days / 30)} months ago`;
}

export default function ClothingCard({ item, onChange, onDelete }) {
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState('');

  const days = daysSince(item.last_worn);
  const stale = item.last_worn === null || (days !== null && days >= 30);

  async function updateLastWorn(value) {
    setErr('');
    setSaving(true);
    try {
      const { error } = await supabase
        .from('clothing_items')
        .update({ last_worn: value || null })
        .eq('id', item.id);
      if (error) throw error;
      onChange?.({ ...item, last_worn: value || null });
    } catch (e) {
      setErr(e.message || 'Could not update.');
    } finally {
      setSaving(false);
    }
  }

  async function markWornToday() {
    await updateLastWorn(new Date().toISOString().slice(0, 10));
  }

  async function handleDelete() {
    if (!confirm(`Delete "${item.name}"?`)) return;
    setErr('');
    setSaving(true);
    try {
      const { error } = await supabase.from('clothing_items').delete().eq('id', item.id);
      if (error) throw error;
      await deleteFromStorage('clothing', item.image_url);
      onDelete?.(item.id);
    } catch (e) {
      setErr(e.message || 'Could not delete.');
      setSaving(false);
    }
  }

  return (
    <div className="group relative overflow-hidden rounded-3xl bg-white shadow-soft">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="relative block aspect-[4/5] w-full overflow-hidden bg-cream-dark"
      >
        {item.image_url && (
          <img
            src={item.image_url}
            alt={item.name}
            className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.03]"
            loading="lazy"
          />
        )}
        {stale && (
          <span className="absolute left-2 top-2 rounded-full bg-amber/90 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-white">
            stale
          </span>
        )}
      </button>

      <div className="space-y-0.5 px-3 pb-3 pt-2.5">
        <p className="truncate text-sm font-medium text-ink">{item.name}</p>
        <p className="text-[11px] text-ink-muted">
          {item.category} · {formatWorn(item.last_worn)}
        </p>
      </div>

      {open && (
        <div className="space-y-2.5 border-t border-line bg-cream/60 px-3 py-3">
          <div>
            <label className="label mb-1" htmlFor={`lw-${item.id}`}>
              Last worn
            </label>
            <input
              id={`lw-${item.id}`}
              type="date"
              value={item.last_worn ?? ''}
              max={new Date().toISOString().slice(0, 10)}
              onChange={(e) => updateLastWorn(e.target.value)}
              className="input !py-2 text-sm"
              disabled={saving}
            />
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={markWornToday}
              className="btn-secondary btn-sm flex-1"
              disabled={saving}
            >
              <Icon name="check" className="h-4 w-4" /> Wore today
            </button>
            <button
              type="button"
              onClick={handleDelete}
              className="btn-icon !h-9 !w-9 hover:bg-terracotta/10 hover:text-terracotta"
              disabled={saving}
              aria-label={`Delete ${item.name}`}
            >
              <Icon name="trash" className="h-4 w-4" />
            </button>
          </div>
          {err && <p className="text-xs text-terracotta">{err}</p>}
        </div>
      )}
    </div>
  );
}
