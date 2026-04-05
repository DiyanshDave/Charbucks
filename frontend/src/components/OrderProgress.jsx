import { CheckCircle2, Circle, Loader2 } from 'lucide-react';

const STEPS = [
  { key: 'created', label: 'Order Placed' },
  { key: 'to_cook', label: 'Sent to Kitchen' },
  { key: 'preparing', label: 'Preparing' },
  { key: 'completed', label: 'Ready to Serve' },
  { key: 'paid', label: 'Paid' },
];

export default function OrderProgress({ status }) {
  const currentIdx = STEPS.findIndex(s => s.key === status);
  const activeIdx = currentIdx >= 0 ? currentIdx : 0;

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 0, width: '100%' }}>
      {STEPS.map((step, idx) => {
        const isDone = idx < activeIdx;
        const isCurrent = idx === activeIdx;
        const isPending = idx > activeIdx;

        return (
          <div key={step.key} style={{ display: 'flex', alignItems: 'center', flex: idx < STEPS.length - 1 ? 1 : 'none' }}>
            {/* Step circle */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.375rem', minWidth: '60px' }}>
              <div style={{
                width: '28px', height: '28px', borderRadius: '50%',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                background: isDone ? 'var(--success)'
                  : isCurrent ? 'var(--primary)'
                  : 'var(--surface-container-highest)',
                transition: 'all 0.3s ease',
                boxShadow: isCurrent ? '0 0 0 4px rgba(36,52,12,0.15)' : 'none',
              }}>
                {isDone ? (
                  <CheckCircle2 size={14} style={{ color: 'white' }} />
                ) : isCurrent ? (
                  <Loader2 size={14} style={{ color: 'white', animation: 'spin 2s linear infinite' }} />
                ) : (
                  <Circle size={14} style={{ color: 'var(--outline)', opacity: 0.4 }} />
                )}
              </div>
              <span style={{
                fontSize: '0.5625rem', fontWeight: isDone || isCurrent ? 700 : 400,
                color: isDone ? 'var(--success)' : isCurrent ? 'var(--primary)' : 'var(--on-surface-variant)',
                textTransform: 'uppercase', letterSpacing: '0.03em',
                textAlign: 'center', lineHeight: 1.2, maxWidth: '70px',
              }}>
                {step.label}
              </span>
            </div>

            {/* Connecting line */}
            {idx < STEPS.length - 1 && (
              <div style={{
                flex: 1, height: '3px', borderRadius: '2px', marginBottom: '1.25rem',
                background: isDone
                  ? 'linear-gradient(90deg, var(--success), var(--success))'
                  : isCurrent
                    ? 'linear-gradient(90deg, var(--primary), var(--surface-container-highest))'
                    : 'var(--surface-container-highest)',
                transition: 'all 0.3s ease',
                position: 'relative',
                overflow: 'hidden',
              }}>
                {isCurrent && (
                  <div style={{
                    position: 'absolute', top: 0, left: 0, height: '100%', width: '40%',
                    background: 'var(--primary)',
                    borderRadius: '2px',
                    animation: 'progressPulse 2s ease-in-out infinite',
                  }} />
                )}
              </div>
            )}
          </div>
        );
      })}

      {/* Keyframe for the spinning loader and progress pulse */}
      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes progressPulse {
          0% { width: 20%; opacity: 0.5; }
          50% { width: 60%; opacity: 1; }
          100% { width: 20%; opacity: 0.5; }
        }
      `}</style>
    </div>
  );
}