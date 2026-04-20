import { useEffect, useState } from 'react';
import { supabase, CATEGORIES } from '../lib/supabase.js';
import { uploadImage } from '../lib/storage.js';
import UploadDropzone from './UploadDropzone.jsx';
import LoadingSpinner from './LoadingSpinner.jsx';
import Icon from './Icon.jsx';

/**
 * Mobile bottom sheet for adding a new clothing item.
 */
export default function AddItemSheet({ open, onClose, onAdded }) {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState('');
  const [name, setName] = useState('');
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState('');

  useEffect(() => {
    if (!open) {
      setFile(null);
      setName('');
      setCategory(CATEGORIES[0]);
      setErr('');
    }
  }, [open]);

  useEffect(() => {
    if (!file) return setPreview('');
    const url = URL.createObjectURL(file);
    setPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!file || !name.trim()) return;
    setErr('');
    setSaving(true);
    try {
      const { publicUrl } = await uploadImage('clothing', file);
      const { data, error } = await supabase
        .from('clothing_items')
        .insert({ name: name.trim(), category, image_url: publicUrl })
        .select()
        .single();
      if (error) throw error;
      onAdded?.(data);
      onClose();
    } catch (e) {
      setErr(e.message || 'Could not add item.');
    } finally {
      setSaving(false);
    }
  }

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-30 flex items-end justify-center">
      <button
        type="button"
        aria-label="Close"
        onClick={onClose}
        className="absolute inset-0 bg-ink/40"
      />
      <div className="relative z-10 w-full max-w-md animate-[slideUp_.25s_ease-out] rounded-t-[2rem] bg-cream pb-safe shadow-lift">
        <style>{`@keyframes slideUp { from { transform: translateY(100%);} to { transform: translateY(0);} }`}</style>
        <div className="flex items-center justify-between px-5 pt-4">
          <div className="h-1 w-10 rounded-full bg-line" aria-hidden="true" />
          <button type="button" onClick={onClose} className="btn-icon" aria-label="Close">
            <Icon name="close" />
          </button>
        </div>
        <div className="px-5 pb-5 pt-2">
          <h2 className="serif-display mb-1 text-3xl">New piece</h2>
          <p className="mb-4 text-sm text-ink-muted">
            Snap a photo on a plain background for the best results.
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            {preview ? (
              <div className="relative overflow-hidden rounded-3xl">
                <img
                  src={preview}
                  alt="Preview"
                  className="aspect-[4/5] w-full object-cover"
                />
                <button
                  type="button"
                  onClick={() => setFile(null)}
                  className="absolute right-3 top-3 btn-icon"
                  aria-label="Replace photo"
                >
                  <Icon name="refresh" />
                </button>
              </div>
            ) : (
              <UploadDropzone onFile={setFile} label="Add a photo" />
            )}

            <div>
              <label className="label" htmlFor="item-name">Name</label>
              <input
                id="item-name"
                className="input"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="White linen shirt"
                required
              />
            </div>

            <div>
              <label className="label">Category</label>
              <div className="flex flex-wrap gap-2">
                {CATEGORIES.map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setCategory(c)}
                    className={category === c ? 'chip-active' : 'chip-default'}
                  >
                    {c}
                  </button>
                ))}
              </div>
            </div>

            {err && <p className="rounded-xl bg-terracotta/10 px-3 py-2 text-xs text-terracotta">{err}</p>}

            <button
              type="submit"
              className="btn-primary w-full"
              disabled={saving || !file || !name.trim()}
            >
              {saving ? <LoadingSpinner size="sm" label="Adding…" /> : 'Add to closet'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
