import { useAppState } from '@/lib/app-context';

function formatNumber(value: number): string {
  const abs = Math.abs(value);
  const formatted = abs.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 });
  return value < 0 ? `-${formatted}` : formatted;
}

interface CurrencyDisplayProps {
  value: number;
  className?: string;
  showSecondary?: boolean;
}

export function CurrencyDisplay({ value, className, showSecondary = false }: CurrencyDisplayProps) {
  const { state } = useAppState();
  const { conversionRate } = state.settings;

  if (showSecondary && conversionRate) {
    const converted = value * conversionRate;
    return <span className={className}>{formatNumber(converted)}</span>;
  }

  return <span className={className}>{formatNumber(value)}</span>;
}
