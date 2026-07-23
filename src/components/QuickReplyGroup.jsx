export default function QuickReplyGroup({ options = [], onSelect = () => {}, className = '' }) {
  if (!options.length) return null;

  return (
    <div className={`flex flex-wrap gap-2 ${className}`.trim()}>
      {options.map((option) => (
        <button
          key={option.id}
          type="button"
          className="focus-ring inline-flex items-center justify-center rounded-full border border-[#DDE5EF] bg-white px-3.5 py-2 text-sm font-semibold text-[#003781] transition hover:-translate-y-0.5 hover:border-[#C7D8F1] hover:bg-[#F4F8FF]"
          onClick={() => onSelect(option)}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}
