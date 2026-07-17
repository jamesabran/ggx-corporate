import { useRef, useState } from 'react';
import { IconPaperclip, IconX } from '@tabler/icons-react';
import {
  ALLOWED_EXTENSIONS,
  MAX_FILES_PER_SUBMISSION,
  formatBytes,
  validateCandidate,
} from '../lib/attachmentPolicy';

/**
 * Shared attachment picker for the support surfaces (Report an Issue drawer +
 * ticket reply composer). Collects REAL files, validated against the shared
 * attachment policy — the same allowlist / 10-MB / 5-file / double-extension rules
 * HeyQ enforces server-side over the bytes. The parent uploads on submit; this
 * component only gathers, validates, and lets the user remove a staged file. The
 * `accept` attribute is a convenience, never the security boundary.
 */
export function AttachmentInput({
  value,
  onChange,
  disabled,
}: {
  value: File[];
  onChange: (next: File[]) => void;
  disabled?: boolean;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [errors, setErrors] = useState<string[]>([]);

  const atLimit = value.length >= MAX_FILES_PER_SUBMISSION;

  function onPick(fileList: FileList | null) {
    if (!fileList) return;
    const accepted: File[] = [];
    const nextErrors: string[] = [];

    for (const file of Array.from(fileList)) {
      const error = validateCandidate({ name: file.name, size: file.size, type: file.type });
      if (error) { nextErrors.push(error); continue; }
      if ([...value, ...accepted].some((f) => f.name === file.name && f.size === file.size)) continue; // dedupe
      accepted.push(file);
    }

    if (value.length + accepted.length > MAX_FILES_PER_SUBMISSION) {
      const room = Math.max(0, MAX_FILES_PER_SUBMISSION - value.length);
      nextErrors.push(`You can attach at most ${MAX_FILES_PER_SUBMISSION} files.`);
      accepted.splice(room);
    }

    setErrors(nextErrors);
    if (accepted.length) onChange([...value, ...accepted]);
    if (inputRef.current) inputRef.current.value = '';
  }

  function remove(index: number) {
    onChange(value.filter((_, i) => i !== index));
    setErrors([]);
  }

  return (
    <div className="flex flex-col gap-2">
      <input
        ref={inputRef}
        type="file"
        multiple
        accept={ALLOWED_EXTENSIONS.map((e) => `.${e}`).join(',')}
        className="hidden"
        onChange={(e) => onPick(e.target.files)}
        disabled={disabled || atLimit}
      />
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        disabled={disabled || atLimit}
        className="inline-flex w-fit items-center gap-1.5 rounded-lg border border-gray-300 px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
      >
        <IconPaperclip className="h-4 w-4" />
        Attach files
      </button>
      <p className="text-[11px] text-gray-400">
        Up to {MAX_FILES_PER_SUBMISSION} files, 10 MB each. Images, PDF, Office docs, CSV, TXT, ZIP.
      </p>

      {value.length > 0 && (
        <ul className="flex flex-col gap-1.5">
          {value.map((f, i) => (
            <li key={`${f.name}-${f.size}-${i}`} className="flex items-center justify-between gap-2 rounded-lg border border-gray-200 bg-gray-50 px-3 py-1.5 text-sm">
              <span className="truncate text-gray-800">{f.name}</span>
              <span className="flex items-center gap-2">
                <span className="text-xs text-gray-400">{formatBytes(f.size)}</span>
                <button
                  type="button"
                  onClick={() => remove(i)}
                  aria-label={`Remove ${f.name}`}
                  className="text-gray-400 hover:text-red-600"
                  disabled={disabled}
                >
                  <IconX className="h-3.5 w-3.5" />
                </button>
              </span>
            </li>
          ))}
        </ul>
      )}

      {errors.length > 0 && (
        <ul role="alert" className="flex flex-col gap-0.5">
          {errors.map((e, i) => (
            <li key={i} className="text-xs font-medium text-red-600">{e}</li>
          ))}
        </ul>
      )}
    </div>
  );
}
