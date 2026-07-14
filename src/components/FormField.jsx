export default function FormField({
  label,
  value,
  onChange,
  error,
  helperText,
  type = 'text',
  placeholder,
  disabled = false,
  readOnly = false,
  autoIdentified = false
}) {
  return (
    <label className="block">
      <div className="mb-1.5 flex items-center justify-between gap-3">
        <span className="text-xs font-bold uppercase tracking-[0.2em] text-slate-500">{label}</span>
        {autoIdentified && (
          <span className="rounded-full bg-sky-100 px-2.5 py-1 text-[11px] font-bold text-sky-800">
            Dato identificado automáticamente
          </span>
        )}
      </div>
      <input
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        disabled={disabled}
        readOnly={readOnly}
        className={`focus-ring w-full rounded-2xl border px-4 py-3 text-sm font-medium text-slate-900 transition placeholder:text-slate-400 ${
          error ? 'border-rose-300 bg-rose-50 focus:border-rose-500' : 'border-slate-200 bg-white focus:border-sky-400'
        } ${disabled || readOnly ? 'cursor-not-allowed bg-slate-50 text-slate-600' : ''}`}
      />
      {error ? (
        <p className="mt-1.5 text-xs font-semibold text-rose-600">{error}</p>
      ) : helperText ? (
        <p className="mt-1.5 text-xs text-slate-500">{helperText}</p>
      ) : null}
    </label>
  );
}
