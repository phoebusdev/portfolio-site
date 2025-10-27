import './GlassCard.css';

function GlassCard({ children, intensity = 'medium', className = '' }) {
  return (
    <div className={`glass-card glass-${intensity} ${className}`}>
      {children}
    </div>
  );
}

export default GlassCard;
