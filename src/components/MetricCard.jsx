import { motion } from 'framer-motion';

export function MetricCard({ label, value, tone = 'default', delay = 0 }) {
  const toneMap = {
    critical: 'text-rose-400',
    high: 'text-orange-400',
    medium: 'text-amber-300',
    low: 'text-emerald-300',
    default: 'text-indigo-200'
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, delay }}
      className="metric-card"
    >
      <p className="text-sm font-semibold text-slate-400 dark:text-slate-400">{label}</p>
      <p className={`mt-3 text-4xl font-black tracking-tight ${toneMap[tone]}`}>{value}</p>
    </motion.div>
  );
}
