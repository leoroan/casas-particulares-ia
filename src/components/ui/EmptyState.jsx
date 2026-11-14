export default function EmptyState({ title, subtitle, action, actionLabel }) {
  return (
    <div className="card border-0 bg-transparent shadow-none">
      <div className="card-body text-center py-5">
        <span className="opacity-25" style={{ fontSize: 3.5rem }}>&mdash;</span>
        <h3 className="mt-4 text-muted">{title}</h3>
        <p className="text-muted">{subtitle}</p>
        {action && actionLabel && (
          <button className="btn btn-cp mt-3" onClick={action}>
            {actionLabel}
          </button>
        )}
      </div>
    </div>
  );
}