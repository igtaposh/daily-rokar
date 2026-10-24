export default function Popup({
  children,
  className,
  overlayClassName = "fixed inset-0 z-50 flex items-center justify-center bg-[#10291f]/55 p-4",
  role = "dialog",
  labelledBy,
  describedBy,
  label,
}) {
  return (
    <div className={overlayClassName}>
      <section
        role={role}
        aria-modal="true"
        aria-labelledby={labelledBy}
        aria-describedby={describedBy}
        aria-label={label}
        className={className}
      >
        {children}
      </section>
    </div>
  );
}
