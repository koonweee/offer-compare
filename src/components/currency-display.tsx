import { useAppState } from '@/lib/app-context';

function formatNumber(value: number): string {
  return value.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 });
}

interface CurrencyDisplayProps {
  value: number;
  className?: string;
  showSecondary?: boolean;
}

export function CurrencyDisplay({ value, className, showSecondary = false }: CurrencyDisplayProps) {
  const { state } = useAppState();
  const { mainCurrency, secondaryCurrency, conversionRate } = state.settings;

  if (showSecondary && secondaryCurrency && conversionRate) {
    const converted = value * conversionRate;
    return <span className={className}>{secondaryCurrency} {formatNumber(converted)}</span>;
  }

  return <span className={className}>{mainCurrency} {formatNumber(value)}</span>;
}
