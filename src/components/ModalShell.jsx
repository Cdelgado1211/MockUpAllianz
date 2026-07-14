export default function ModalShell({
  children,
  title,
  subtitle,
  actions,
  className = '',
  bodyClassName = '',
  style,
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/55 px-3 py-3 backdrop-blur-sm sm:px-4 sm:py-4">
      <div
        className={`flex w-full max-w-3xl max-h-[calc(100vh-1rem)] flex-col overflow-hidden rounded-[2rem] border border-white/70 bg-white shadow-soft sm:max-h-[calc(100vh-2rem)] ${className}`}
        style={style}
      >
        {(title || subtitle) && (
          <div className="border-b border-slate-200 px-5 py-4 sm:px-6 sm:py-5">
            {title && <h2 className="text-xl font-extrabold text-slate-900 sm:text-2xl">{title}</h2>}
            {subtitle && <p className="mt-2 text-sm leading-6 text-slate-600">{subtitle}</p>}
          </div>
        )}
        <div className={`flex-1 overflow-y-auto px-5 py-4 sm:px-6 sm:py-5 ${bodyClassName}`}>{children}</div>
        {actions && <div className="border-t border-slate-200 px-5 py-3 sm:px-6 sm:py-4">{actions}</div>}
      </div>
    </div>
  );
}
