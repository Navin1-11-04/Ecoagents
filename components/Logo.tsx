export default function Logo({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' }) {
  const sizes = {
    sm: { icon: 20, text: 'text-sm' },
    md: { icon: 24, text: 'text-base' },
    lg: { icon: 32, text: 'text-xl' },
  };
  const s = sizes[size];
  return (
    <div className="flex items-center gap-2.5">
      <svg width={s.icon} height={s.icon} viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="16" cy="16" r="16" fill="#16a34a" />
        <ellipse cx="16" cy="16" rx="6" ry="10" stroke="white" strokeWidth="1.5" fill="none" />
        <ellipse cx="16" cy="16" rx="10" ry="6" stroke="white" strokeWidth="1.5" fill="none" />
        <circle cx="16" cy="16" r="2.5" fill="white" />
      </svg>
      <span className={`font-semibold text-gray-900 tracking-tight ${s.text}`}>EcoAgents</span>
    </div>
  );
}