import { useDropzone } from 'react-dropzone';
import Icon from './Icon.jsx';

export default function UploadDropzone({
  onFile,
  accept = { 'image/*': [] },
  disabled = false,
  hint = 'PNG, JPG, or WEBP',
  label = 'Tap to upload or drop a photo',
  compact = false,
  className = '',
}) {
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept,
    multiple: false,
    disabled,
    onDrop: (files) => {
      if (files[0]) onFile(files[0]);
    },
  });

  return (
    <div
      {...getRootProps()}
      className={[
        'flex cursor-pointer flex-col items-center justify-center rounded-3xl border border-dashed text-center transition',
        compact ? 'px-4 py-6' : 'px-6 py-10',
        isDragActive
          ? 'border-ink bg-cream-dark/60'
          : 'border-line bg-white hover:border-ink/40 hover:bg-cream-dark/40',
        disabled ? 'cursor-not-allowed opacity-60' : '',
        className,
      ].join(' ')}
    >
      <input {...getInputProps()} />
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-cream-dark text-ink">
        <Icon name="camera" />
      </div>
      <p className="mt-3 text-sm font-medium text-ink">{label}</p>
      <p className="mt-1 text-xs text-ink-muted">{hint}</p>
    </div>
  );
}
