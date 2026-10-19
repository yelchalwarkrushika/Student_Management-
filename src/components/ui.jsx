import { X } from 'lucide-react';

export function Button({ children, variant = 'primary', className = '', ...props }) {
  return <button className={`button button-${variant} ${className}`} {...props}>{children}</button>;
}

export function IconButton({ label, className = '', children, ...props }) {
  return <button className={`icon-button ${className}`} aria-label={label} title={label} {...props}>{children}</button>;
}

export function Panel({ children, className = '', ...props }) {
  return <section className={`panel ${className}`} {...props}>{children}</section>;
}

export function PanelHeading({ title, detail, action }) {
  return <div className="panel-heading"><div><h2>{title}</h2>{detail && <p>{detail}</p>}</div>{action}</div>;
}

export function Badge({ children, tone = 'neutral' }) {
  return <span className={`badge badge-${tone}`}>{children}</span>;
}

export function Field({ label, error, className = '', ...props }) {
  return <label className={`field ${className}`}>
    <span>{label}</span>
    <input {...props} aria-invalid={Boolean(error)} />
    {error && <small className="field-error">{error}</small>}
  </label>;
}

export function SelectField({ label, options, className = '', ...props }) {
  return <label className={`field ${className}`}>
    <span>{label}</span>
    <select {...props}>{options.map(option => typeof option === 'string'
      ? <option key={option} value={option}>{option}</option>
      : <option key={option.value} value={option.value}>{option.label}</option>)}</select>
  </label>;
}

export function Modal({ title, description, onClose, children, wide = false }) {
  return <div className="modal-backdrop" onMouseDown={event => event.target === event.currentTarget && onClose()}>
    <section className={`modal ${wide ? 'modal-wide' : ''}`} role="dialog" aria-modal="true" aria-labelledby="modal-title">
      <header className="modal-heading"><div><h2 id="modal-title">{title}</h2>{description && <p>{description}</p>}</div><IconButton label="Close dialog" onClick={onClose}><X size={18} /></IconButton></header>
      {children}
    </section>
  </div>;
}

export function EmptyState({ title, detail, action }) {
  return <div className="empty-state"><span className="empty-mark">CF</span><h3>{title}</h3><p>{detail}</p>{action}</div>;
}

export function PageTitle({ eyebrow, title, detail, actions }) {
  return <div className="page-title"><div><span className="eyebrow">{eyebrow}</span><h1>{title}</h1>{detail && <p>{detail}</p>}</div><div className="page-actions">{actions}</div></div>;
}

export function InlineNotice({ children, tone = 'success' }) {
  if (!children) return null;
  return <div className={`inline-notice notice-${tone}`} role={tone === 'error' ? 'alert' : 'status'}>{children}</div>;
}