export default function Toast({ toasts, onRemove }) {
  if (!toasts || toasts.length === 0) return null;
  return (
    <div className="toast-container position-fixed top-0 end-0 p-3" style={{ zIndex: 9999 }}>
      {toasts.map((t) => (
        <div
          key={t.id}
          className={`toast align-items-center text-white bg-${
            t.type === 'success' ? 'success' : t.type === 'error' ? 'danger' : t.type === 'warning' ? 'warning' : 'primary'
          } border-0 shadow`}
          role="alert"
          aria-live="assertive"
          aria-atomic="true"
        >
          <div className="d-flex">
            <div className="toast-body">{t.msg}</div>
            <button
              type="button"
              className="btn-close btn-close-white me-2 m-auto"
              onClick={() => onRemove(t.id)}
              aria-label="Cerrar"
            ></button>
          </div>
        </div>
      ))}
    </div>
  );
}