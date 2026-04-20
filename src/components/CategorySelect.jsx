import Icon from './Icon.jsx';

/**
 * Horizontal, snap-scrolling tile picker. One tap selects, second tap deselects.
 */
export default function CategorySelect({ title, items, selectedId, onSelect, emptyHint, hint }) {
  return (
    <div>
      <div className="mb-3 flex items-baseline justify-between gap-2">
        <div>
          <h3 className="font-serif text-xl text-ink">{title}</h3>
          {hint && <p className="text-[11px] text-ink-muted">{hint}</p>}
        </div>
        <span className="text-[11px] uppercase tracking-[0.14em] text-ink-muted">
          {items.length} {items.length === 1 ? 'item' : 'items'}
        </span>
      </div>
      {items.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-line bg-white/60 px-4 py-6 text-center text-xs text-ink-muted">
          {emptyHint || 'Add items in the Closet tab first.'}
        </div>
      ) : (
        <div className="-mx-4 flex snap-x snap-mandatory gap-2.5 overflow-x-auto px-4 pb-1 scroll-x-hide">
          {items.map((item) => {
            const selected = item.id === selectedId;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => onSelect(selected ? null : item.id)}
                className={[
                  'group relative flex w-28 shrink-0 snap-start flex-col overflow-hidden rounded-2xl text-left transition',
                  selected
                    ? 'shadow-lift ring-2 ring-ink'
                    : 'shadow-soft ring-1 ring-line hover:ring-ink/30',
                ].join(' ')}
                aria-pressed={selected}
              >
                <div className="aspect-square w-full bg-cream-dark">
                  <img
                    src={item.image_url}
                    alt={item.name}
                    className="h-full w-full object-cover"
                    loading="lazy"
                  />
                </div>
                <span className="truncate bg-white px-2 py-1.5 text-[11px] font-medium text-ink">
                  {item.name}
                </span>
                {selected && (
                  <span className="absolute right-1.5 top-1.5 flex h-6 w-6 items-center justify-center rounded-full bg-ink text-cream">
                    <Icon name="check" className="h-3.5 w-3.5" strokeWidth={2.5} />
                  </span>
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
