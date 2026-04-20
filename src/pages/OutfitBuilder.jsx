import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase, USER_PHOTO_ID } from '../lib/supabase.js';
import { uploadImage, uploadImageAtPath } from '../lib/storage.js';
import { getReplicateKey, runIdmVton } from '../lib/replicate.js';
import TopBar from '../components/TopBar.jsx';
import UploadDropzone from '../components/UploadDropzone.jsx';
import CategorySelect from '../components/CategorySelect.jsx';
import LoadingSpinner from '../components/LoadingSpinner.jsx';
import ErrorBanner from '../components/ErrorBanner.jsx';
import Icon from '../components/Icon.jsx';

const USER_PHOTO_PATH = 'user/photo.jpg';

export default function OutfitBuilder() {
  const navigate = useNavigate();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState('');

  const [userPhotoUrl, setUserPhotoUrl] = useState('');
  const [uploadingPhoto, setUploadingPhoto] = useState(false);

  const [topId, setTopId] = useState(null);
  const [bottomId, setBottomId] = useState(null);
  const [shoesId, setShoesId] = useState(null);

  const [status, setStatus] = useState('');
  const [tryOnError, setTryOnError] = useState('');
  const [resultUrl, setResultUrl] = useState('');
  const [resultItemIds, setResultItemIds] = useState([]);
  const [saving, setSaving] = useState(false);
  const [savedOk, setSavedOk] = useState(false);

  useEffect(() => {
    load();
  }, []);

  async function load() {
    setLoading(true);
    setErr('');
    try {
      const [itemsRes, photoRes] = await Promise.all([
        supabase.from('clothing_items').select('*').order('created_at', { ascending: false }),
        supabase.from('user_photo').select('*').eq('id', USER_PHOTO_ID).maybeSingle(),
      ]);
      if (itemsRes.error) throw itemsRes.error;
      if (photoRes.error) throw photoRes.error;
      setItems(itemsRes.data || []);
      setUserPhotoUrl(photoRes.data?.image_url || '');
    } catch (e) {
      setErr(e.message || 'Could not load builder.');
    } finally {
      setLoading(false);
    }
  }

  const byCategory = useMemo(() => {
    const group = { Tops: [], Bottoms: [], Shoes: [] };
    for (const it of items) if (group[it.category]) group[it.category].push(it);
    return group;
  }, [items]);

  async function handlePhotoUpload(file) {
    setErr('');
    setUploadingPhoto(true);
    try {
      const { publicUrl } = await uploadImageAtPath('outfits', USER_PHOTO_PATH, file);
      const { error } = await supabase
        .from('user_photo')
        .upsert({ id: USER_PHOTO_ID, image_url: publicUrl });
      if (error) throw error;
      setUserPhotoUrl(publicUrl);
    } catch (e) {
      setErr(e.message || 'Could not upload photo.');
    } finally {
      setUploadingPhoto(false);
    }
  }

  async function handleTryOn() {
    setTryOnError('');
    setResultUrl('');
    setSavedOk(false);

    if (!userPhotoUrl) return setTryOnError('Upload a full-body photo of yourself first.');
    if (!topId) return setTryOnError('Pick a top.');
    if (!bottomId) return setTryOnError('Pick bottoms.');
    if (!getReplicateKey())
      return setTryOnError('No Replicate API key yet — add it in Settings.');

    const top = items.find((i) => i.id === topId);
    const bottom = items.find((i) => i.id === bottomId);

    try {
      setStatus('top');
      const afterTop = await runIdmVton({
        humanUrl: userPhotoUrl,
        garmentUrl: top.image_url,
        category: 'upper_body',
        description: top.name,
      });

      setStatus('bottom');
      const afterBottom = await runIdmVton({
        humanUrl: afterTop,
        garmentUrl: bottom.image_url,
        category: 'lower_body',
        description: bottom.name,
      });

      setStatus('saving');
      const blob = await (await fetch(afterBottom)).blob();
      const { publicUrl } = await uploadImage('outfits', blob, { pathPrefix: 'results/' });
      setResultUrl(publicUrl);
      setResultItemIds([topId, bottomId, ...(shoesId ? [shoesId] : [])]);
    } catch (e) {
      setTryOnError(e.message || 'Try-on failed.');
    } finally {
      setStatus('');
    }
  }

  async function handleSaveOutfit() {
    if (!resultUrl) return;
    setSaving(true);
    setTryOnError('');
    try {
      const { error } = await supabase
        .from('outfits')
        .insert({ result_image_url: resultUrl, item_ids: resultItemIds });
      if (error) throw error;
      setSavedOk(true);
    } catch (e) {
      setTryOnError(e.message || 'Could not save outfit.');
    } finally {
      setSaving(false);
    }
  }

  const busy = status !== '';
  const statusLabel = {
    top: 'Applying top…',
    bottom: 'Applying bottoms…',
    saving: 'Saving result…',
  }[status];

  const ready = userPhotoUrl && topId && bottomId;

  return (
    <>
      <TopBar
        eyebrow="Try it on"
        title="Build a look"
        subtitle="Pick a top and bottoms. We'll composite them onto your photo."
      />

      <ErrorBanner message={err} onDismiss={() => setErr('')} />

      {loading ? (
        <LoadingSpinner label="Loading…" />
      ) : (
        <div className="space-y-6">
          {/* User photo card */}
          <section className="card overflow-hidden">
            <div className="flex items-start gap-4 p-4">
              <div className="relative h-28 w-20 shrink-0 overflow-hidden rounded-2xl bg-cream-dark">
                {userPhotoUrl ? (
                  <img src={userPhotoUrl} alt="You" className="h-full w-full object-cover" />
                ) : (
                  <div className="flex h-full items-center justify-center text-ink-soft">
                    <Icon name="camera" className="h-6 w-6" />
                  </div>
                )}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-[11px] uppercase tracking-[0.14em] text-ink-muted">Your photo</p>
                <h3 className="font-serif text-xl text-ink">
                  {userPhotoUrl ? 'Looking good' : 'Add your photo'}
                </h3>
                <p className="mt-0.5 text-xs text-ink-muted">
                  A full-body shot on a plain background works best.
                </p>
                {uploadingPhoto ? (
                  <div className="mt-2"><LoadingSpinner size="sm" label="Uploading…" /></div>
                ) : (
                  <label className="mt-2 inline-flex cursor-pointer items-center gap-1.5 text-sm font-medium text-ink underline-offset-2 hover:underline">
                    <Icon name="camera" className="h-4 w-4" />
                    {userPhotoUrl ? 'Replace photo' : 'Upload photo'}
                    <input
                      type="file"
                      accept="image/*"
                      className="sr-only"
                      onChange={(e) => e.target.files?.[0] && handlePhotoUpload(e.target.files[0])}
                    />
                  </label>
                )}
              </div>
            </div>
            {!userPhotoUrl && !uploadingPhoto && (
              <div className="border-t border-line p-4">
                <UploadDropzone
                  onFile={handlePhotoUpload}
                  disabled={uploadingPhoto}
                  compact
                  label="Upload a full-body photo"
                  hint="Stand facing the camera, plain background"
                />
              </div>
            )}
          </section>

          {/* Pickers */}
          <div className="space-y-5">
            <CategorySelect
              title="Top"
              hint="Upper body garment"
              items={byCategory.Tops}
              selectedId={topId}
              onSelect={setTopId}
            />
            <CategorySelect
              title="Bottoms"
              hint="Lower body garment"
              items={byCategory.Bottoms}
              selectedId={bottomId}
              onSelect={setBottomId}
            />
            <CategorySelect
              title="Shoes"
              hint="Saved with the look (not composited)"
              items={byCategory.Shoes}
              selectedId={shoesId}
              onSelect={setShoesId}
            />
          </div>

          {/* CTA */}
          <div className="sticky bottom-24 z-[5]">
            <button
              type="button"
              onClick={handleTryOn}
              className="btn-primary w-full shadow-lift"
              disabled={busy || !ready}
            >
              {busy ? (
                <LoadingSpinner size="sm" label={statusLabel} />
              ) : (
                <>
                  <Icon name="wand" className="h-5 w-5" /> Try it on
                </>
              )}
            </button>
            {!busy && !ready && (
              <p className="mt-2 text-center text-xs text-ink-muted">
                Pick a top and bottoms to enable try-on.
              </p>
            )}
            {busy && (
              <p className="mt-2 text-center text-xs text-ink-muted">
                Usually 1–3 minutes. Keep this tab open.
              </p>
            )}
          </div>

          <ErrorBanner message={tryOnError} onDismiss={() => setTryOnError('')} />

          {resultUrl && (
            <section className="card overflow-hidden">
              <img
                src={resultUrl}
                alt="Generated outfit"
                className="aspect-[3/4] w-full bg-cream-dark object-cover"
              />
              <div className="space-y-3 p-4">
                <div>
                  <p className="text-[11px] uppercase tracking-[0.14em] text-ink-muted">Result</p>
                  <h3 className="font-serif text-2xl text-ink">Fresh look</h3>
                </div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={handleSaveOutfit}
                    className="btn-primary flex-1"
                    disabled={saving || savedOk}
                  >
                    {saving ? (
                      <LoadingSpinner size="sm" label="Saving…" />
                    ) : savedOk ? (
                      <>
                        <Icon name="check" className="h-4 w-4" strokeWidth={2.2} /> Saved
                      </>
                    ) : (
                      'Save to lookbook'
                    )}
                  </button>
                  {savedOk && (
                    <button
                      type="button"
                      onClick={() => navigate('/outfits')}
                      className="btn-secondary"
                    >
                      View
                    </button>
                  )}
                </div>
              </div>
            </section>
          )}
        </div>
      )}
    </>
  );
}
