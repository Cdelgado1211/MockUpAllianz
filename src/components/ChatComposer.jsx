import { useEffect, useRef } from 'react';
import { ArrowRightIcon, DownloadIcon, SparkIcon } from './Icon';

function ComposerChip({ label, onClick }) {
  return (
    <button
      type="button"
      className="focus-ring inline-flex items-center rounded-full border border-[#DDE5EF] bg-white px-3 py-1.5 text-xs font-semibold text-[#003781] transition hover:-translate-y-0.5 hover:border-[#C7D8F1] hover:bg-[#F4F8FF]"
      onClick={onClick}
    >
      {label}
    </button>
  );
}

export default function ChatComposer({
  value,
  onChange,
  onSend,
  onAttach,
  placeholder = 'Escribe tu mensaje o selecciona una opción',
  disabled = false,
  suggestions = [],
  onSuggestion
}) {
  const textareaRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    textarea.style.height = 'auto';
    textarea.style.height = `${Math.min(textarea.scrollHeight, 160)}px`;
  }, [value]);

  const handleSubmit = (event) => {
    event.preventDefault();
    onSend?.();
  };

  const handleAttachChange = (event) => {
    const files = Array.from(event.target.files ?? []);
    if (files.length) onAttach?.(files);
    event.target.value = '';
  };

  return (
    <footer className="border-t border-[#DDE5EF] bg-white/95 px-4 py-4 backdrop-blur-sm sm:px-6 lg:px-8">
      {suggestions.length > 0 ? (
        <div className="mb-3 flex flex-wrap gap-2">
          {suggestions.map((item) => (
            <ComposerChip key={item.id} label={item.label} onClick={() => onSuggestion?.(item)} />
          ))}
        </div>
      ) : null}

      <form onSubmit={handleSubmit} className="flex items-end gap-2">
        <input ref={inputRef} type="file" multiple className="hidden" onChange={handleAttachChange} />

        <button
          type="button"
          className="focus-ring inline-flex h-12 w-12 items-center justify-center rounded-2xl border border-[#DDE5EF] bg-white text-[#003781] transition hover:bg-[#F4F8FF]"
          onClick={() => inputRef.current?.click()}
          aria-label="Adjuntar archivos"
        >
          <DownloadIcon className="h-4 w-4" />
        </button>

        <div className="flex-1 rounded-[24px] border border-[#DDE5EF] bg-white px-4 py-3 shadow-sm">
          <textarea
            ref={textareaRef}
            value={value}
            onChange={(event) => onChange?.(event.target.value)}
            placeholder={placeholder}
            disabled={disabled}
            rows={1}
            className="max-h-40 min-h-12 w-full resize-none border-0 bg-transparent text-sm leading-6 text-[#181C1E] outline-none placeholder:text-[#97A1AF] disabled:cursor-not-allowed"
          />
        </div>

        <button
          type="submit"
          disabled={disabled || !String(value ?? '').trim()}
          className={`focus-ring inline-flex h-12 items-center gap-2 rounded-2xl px-4 text-sm font-semibold transition ${
            disabled || !String(value ?? '').trim()
              ? 'cursor-not-allowed bg-[#E9EEF5] text-[#8B94A3]'
              : 'bg-[#003781] text-white hover:bg-[#002356]'
          }`}
        >
          Enviar
          <ArrowRightIcon className="h-4 w-4" />
        </button>
      </form>

      <p className="mt-2 text-[11px] leading-5 text-[#6B7280]">
        Puedes escribir tu respuesta, seleccionar una opción o adjuntar archivos simulados para continuar.
      </p>
    </footer>
  );
}
