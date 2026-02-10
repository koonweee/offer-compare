import { useState } from 'react';
import { useAppState } from '@/lib/app-context';
import {
  computeComponentBreakdown,
  computeSummary,
  computeEVRows,
  computeYearByYear,
  computeDeltas,
  computeEVDeltas,
  computeTaxResult,
} from '@/lib/calculations';
import { formatEffectiveRate } from '@/lib/tax';
import { CurrencyDisplay } from './currency-display';
import { ChevronRight, Info } from 'lucide-react';
import { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';

function findBestIndex(values: number[]): number {
  let best = 0;
  for (let i = 1; i < values.length; i++) {
    if (values[i] > values[best]) best = i;
  }
  return best;
}

interface SectionHeaderProps {
  title: string;
  colSpan: number;
  open: boolean;
  onToggle: () => void;
  tooltip?: string;
}

function SectionHeader({ title, colSpan, open, onToggle, tooltip }: SectionHeaderProps) {
  return (
    <tr
      className={cn(
        "cursor-pointer transition-colors",
        open ? "hover:bg-muted/60" : "hover:bg-muted/70"
      )}
      onClick={onToggle}
    >
      <td
        colSpan={colSpan}
        className={cn(
          "px-4 py-2.5 font-semibold text-sm border-t-2 border-border",
          open ? "bg-muted/50" : "bg-muted/80"
        )}
      >
        <div className="flex items-center gap-1.5">
          <ChevronRight
            className={cn(
              "h-4 w-4 transition-transform",
              open && "rotate-90"
            )}
          />
          <span className="italic">{title}</span>
          {tooltip && (
            <TooltipProvider delayDuration={200}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Info className="h-3.5 w-3.5 text-muted-foreground ml-1 cursor-help" onClick={(e) => e.stopPropagation()} />
                </TooltipTrigger>
                <TooltipContent>
                  <p className="max-w-xs">{tooltip}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
        </div>
      </td>
    </tr>
  );
}

interface DataRowProps {
  label: string;
  values: number[];
  highlight?: boolean;
  delta?: boolean;
  tooltipValues?: number[];
  percentages?: number[];
  showSecondary?: boolean;
}

function DataRow({ label, values, highlight = true, delta = false, tooltipValues, percentages, showSecondary }: DataRowProps) {
  const bestIdx = highlight ? findBestIndex(values) : -1;
  return (
    <tr className="border-t">
      <td className="px-4 py-2 text-sm font-medium whitespace-nowrap">{label}</td>
      {values.map((v, i) => {
        const pct = percentages?.[i];
        const pctDisplay = pct != null && v !== 0
          ? ` (${pct > 0 ? '+' : ''}${Math.round(pct)}%)`
          : '';
        const cellContent = (
          <>
            {delta && v > 0 ? '+' : ''}
            <CurrencyDisplay value={Math.round(v)} showSecondary={showSecondary} />
            {delta && pctDisplay}
          </>
        );
        const tooltipVal = tooltipValues?.[i];
        const isBest = highlight && i === bestIdx && values.filter((x) => x === v).length === 1;
        return (
          <td
            key={i}
            className={cn(
              "px-4 py-2 text-sm text-right tabular-nums",
              isBest && "bg-green-100 dark:bg-green-900/40",
              delta && v > 0 && !isBest && "text-green-700 dark:text-green-400",
              delta && v < 0 && "text-red-600 dark:text-red-400"
            )}
          >
            {tooltipVal != null ? (
              <TooltipProvider delayDuration={200}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <span className="cursor-help border-b border-dotted border-current">{cellContent}</span>
                  </TooltipTrigger>
                  <TooltipContent>
                    Pre-tax: {delta && tooltipVal > 0 ? '+' : ''}<CurrencyDisplay value={Math.round(tooltipVal)} showSecondary={showSecondary} />
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            ) : (
              cellContent
            )}
          </td>
        );
      })}
    </tr>
  );
}

interface CombinedValueLineProps {
  value: number;
  suffix: string;
  delta?: boolean;
  tooltipValue?: number;
  showSecondary?: boolean;
}

function CombinedValueLine({
  value,
  suffix,
  delta = false,
  tooltipValue,
  showSecondary,
}: CombinedValueLineProps) {
  const content = (
    <span>
      {delta && value > 0 ? '+' : ''}
      <CurrencyDisplay value={Math.round(value)} showSecondary={showSecondary} />
      <span className="text-muted-foreground text-xs">{suffix}</span>
    </span>
  );

  if (tooltipValue != null) {
    return (
      <TooltipProvider delayDuration={200}>
        <Tooltip>
          <TooltipTrigger asChild>
            <span className="cursor-help border-b border-dotted border-current">{content}</span>
          </TooltipTrigger>
          <TooltipContent>
            Pre-tax: {delta && tooltipValue > 0 ? '+' : ''}<CurrencyDisplay value={Math.round(tooltipValue)} showSecondary={showSecondary} />
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  return content;
}

interface CombinedDataRowProps {
  label: string;
  yearlyValues: number[];
  monthlyValues: number[];
  highlight?: boolean;
  delta?: boolean;
  yearlyTooltips?: number[];
  monthlyTooltips?: number[];
  percentages?: number[];
  showSecondary?: boolean;
  showDash?: boolean[];
}

function CombinedDataRow({
  label,
  yearlyValues,
  monthlyValues,
  highlight = true,
  delta = false,
  yearlyTooltips,
  monthlyTooltips,
  percentages,
  showSecondary,
  showDash,
}: CombinedDataRowProps) {
  const bestIdx = highlight ? findBestIndex(yearlyValues) : -1;
  return (
    <tr className="border-t">
      <td className="px-4 py-2 text-sm font-medium whitespace-nowrap">{label}</td>
      {yearlyValues.map((yearly, i) => {
        if (showDash?.[i]) {
          return (
            <td
              key={i}
              className="px-4 py-2 text-sm text-right tabular-nums text-muted-foreground"
            >
              —
            </td>
          );
        }

        const monthly = monthlyValues[i];
        const pct = percentages?.[i];
        const hasPct = pct != null && yearly !== 0;
        const isBest = highlight && i === bestIdx && yearlyValues.filter((x) => x === yearly).length === 1;

        return (
          <td
            key={i}
            className={cn(
              "px-4 py-2 text-sm text-right tabular-nums",
              isBest && "bg-green-100 dark:bg-green-900/40",
              delta && yearly > 0 && !isBest && "text-green-700 dark:text-green-400",
              delta && yearly < 0 && "text-red-600 dark:text-red-400"
            )}
          >
            <span className="inline-flex flex-col items-end gap-0.5">
              {hasPct && (
                <span className="font-medium self-end">
                  {pct > 0 ? '+' : ''}{Math.round(pct)}%
                </span>
              )}
              <CombinedValueLine
                value={yearly}
                suffix="/yr"
                delta={delta}
                tooltipValue={yearlyTooltips?.[i]}
                showSecondary={showSecondary}
              />
              <CombinedValueLine
                value={monthly}
                suffix="/mth"
                delta={delta}
                tooltipValue={monthlyTooltips?.[i]}
                showSecondary={showSecondary}
              />
            </span>
          </td>
        );
      })}
    </tr>
  );
}

export function ComparisonTable() {
  const { state } = useAppState();
  const offers = state.offers;
  const settings = state.settings;
  const colSpan = offers.length + 1;

  const [showBreakdown, setShowBreakdown] = useState(true);
  const [showTotalComp, setShowTotalComp] = useState(true);
  const [showEV, setShowEV] = useState(false);
  const [showYearByYear, setShowYearByYear] = useState(false);
  const [showDelta, setShowDelta] = useState(true);
  const [showEVDelta, setShowEVDelta] = useState(false);
  const [showNotes, setShowNotes] = useState(false);
  const [showSecondary, setShowSecondary] = useState(false);

  const { mainCurrency, secondaryCurrency, conversionRate } = settings;
  const canToggleCurrency = Boolean(secondaryCurrency && conversionRate);

  const breakdowns = offers.map(computeComponentBreakdown);
  const summaries = offers.map((o) => computeSummary(o, settings));
  const evRows = offers.map((o) => computeEVRows(o, settings));
  const yearRows = offers.map((o) => computeYearByYear(o, settings));
  const taxResults = offers.map((o) => computeTaxResult(o, settings));

  const currentOffer = offers.find((o) => o.isCurrent);
  const hasPrivate = offers.some((o) => o.isPrivateCompany);

  const maxYears = Math.max(...offers.map((o) => o.equity.years || 0), 0);

  return (
    <div className="overflow-x-auto">
      {canToggleCurrency && (
        <div className="flex items-center justify-end gap-2 px-4 py-2">
          <Label htmlFor="currency-toggle" className="text-sm text-muted-foreground">
            {mainCurrency}
          </Label>
          <Switch
            id="currency-toggle"
            checked={showSecondary}
            onCheckedChange={setShowSecondary}
          />
          <Label htmlFor="currency-toggle" className="text-sm text-muted-foreground">
            {secondaryCurrency}
          </Label>
        </div>
      )}
      <table className="w-full border-collapse">
        <thead>
          <tr className="border-b">
            <th className="px-4 py-3 text-left text-sm font-semibold w-48">Metric</th>
            {offers.map((o) => (
              <th key={o.id} className="px-4 py-3 text-right text-sm font-semibold min-w-[140px]">
                <div className="flex items-center justify-end gap-1.5">
                  {o.name}
                  {o.isCurrent && <Badge variant="secondary" className="text-[10px] px-1.5 py-0">Current</Badge>}
                  {o.isPrivateCompany && <Badge variant="outline" className="text-[10px] px-1.5 py-0">Private</Badge>}
                </div>
              </th>
            ))}
          </tr>
        </thead>

        {/* Component Breakdown — collapsible */}
        <tbody>
          <SectionHeader
            title="Component Breakdown (Pre-tax)"
            colSpan={colSpan}
            open={showBreakdown}
            onToggle={() => setShowBreakdown(!showBreakdown)}
            tooltip="Pre-tax breakdown of each compensation component: base salary, bonus, equity per year, and sign-on bonus"
          />
        </tbody>
        {showBreakdown && (
          <tbody>
            <DataRow label="Base Salary" values={breakdowns.map((b) => b.baseSalary)} showSecondary={showSecondary} />
            <DataRow label="Bonus" values={breakdowns.map((b) => b.bonus)} showSecondary={showSecondary} />
            <DataRow label="Equity / Year" values={breakdowns.map((b) => b.equityPerYear)} showSecondary={showSecondary} />
            <DataRow label="Sign-on" values={breakdowns.map((b) => b.signOn)} showSecondary={showSecondary} />
            <DataRow label="Total" values={breakdowns.map((b) => b.baseSalary + b.bonus + b.equityPerYear + b.signOn)} showSecondary={showSecondary} />
            <tr className="border-t">
              <td className="px-4 py-2 text-sm font-medium whitespace-nowrap">
                Expected Tax
              </td>
              {taxResults.map((r, i) => (
                <td key={i} className="px-4 py-2 text-sm text-right tabular-nums text-red-600 dark:text-red-400">
                  <TooltipProvider delayDuration={200}>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <span className="cursor-help border-b border-dotted border-current">
                          -<CurrencyDisplay value={Math.round(r.totalTax)} showSecondary={showSecondary} />
                        </span>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>{formatEffectiveRate(r)}</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </td>
              ))}
            </tr>
          </tbody>
        )}

        {/* Total Compensation — collapsible */}
        <tbody>
          <SectionHeader
            title="Total Compensation"
            colSpan={colSpan}
            open={showTotalComp}
            onToggle={() => setShowTotalComp(!showTotalComp)}
            tooltip="Post-tax yearly and monthly total compensation including all components"
          />
        </tbody>
        {showTotalComp && (
          <tbody>
            <CombinedDataRow
              label="Total"
              yearlyValues={summaries.map((s) => s.postTaxYearly)}
              monthlyValues={summaries.map((s) => s.postTaxMonthly)}
              yearlyTooltips={summaries.map((s) => s.preTaxYearly)}
              monthlyTooltips={summaries.map((s) => s.preTaxMonthly)}
              showSecondary={showSecondary}
            />
          </tbody>
        )}

        {/* Private Company EV — only if any offer is private */}
        {hasPrivate && (
          <>
            <tbody>
              <SectionHeader
                title="Private Company EV"
                colSpan={colSpan}
                open={showEV}
                onToggle={() => setShowEV(!showEV)}
                tooltip={`Estimated total compensation with equity valued at configured multiples (${settings.evMultipliers.slice().sort((a, b) => a - b).map((m) => `${m}x`).join(', ')})`}
              />
            </tbody>
            {showEV && (
              <tbody>
                {evRows[0].map((_, evIdx) => (
                  <CombinedDataRow
                    key={evIdx}
                    label={`Total (${evRows[0][evIdx].label})`}
                    yearlyValues={evRows.map((rows) => rows[evIdx].postTaxYearly)}
                    monthlyValues={evRows.map((rows) => rows[evIdx].postTaxMonthly)}
                    yearlyTooltips={evRows.map((rows) => rows[evIdx].preTaxYearly)}
                    monthlyTooltips={evRows.map((rows) => rows[evIdx].preTaxMonthly)}
                    showSecondary={showSecondary}
                  />
                ))}
              </tbody>
            )}
          </>
        )}

        {/* Year-by-Year — collapsible */}
        <tbody>
          <SectionHeader
            title="Year-by-Year"
            colSpan={colSpan}
            open={showYearByYear}
            onToggle={() => setShowYearByYear(!showYearByYear)}
            tooltip="Annual compensation based on your equity vesting schedule"
          />
        </tbody>
        {showYearByYear && (
          <tbody>
            {Array.from({ length: maxYears }, (_, i) => (
              <DataRow
                key={i}
                label={`Year ${i + 1}`}
                values={yearRows.map((rows) => rows[i]?.postTax ?? 0)}
                tooltipValues={yearRows.map((rows) => rows[i]?.preTax ?? 0)}
                showSecondary={showSecondary}
              />
            ))}
          </tbody>
        )}

        {/* Delta to Current — only if a current offer exists */}
        {currentOffer && (() => {
          const allDeltas = offers.map((o) => computeDeltas(o, currentOffer, settings));
          const allEVDeltas = hasPrivate ? offers.map((o) => computeEVDeltas(o, currentOffer, settings)) : [];
          const isCurrentOffer = offers.map((o) => o.isCurrent);
          return (
            <>
              <tbody>
                <SectionHeader
                  title="Delta to Current"
                  colSpan={colSpan}
                  open={showDelta}
                  onToggle={() => setShowDelta(!showDelta)}
                  tooltip="Difference compared to your current offer"
                />
              </tbody>
              {showDelta && (
                <>
                  <tbody>
                    {allDeltas[0].map((_row, rowIdx) => {
                      const row = allDeltas[0][rowIdx];
                      return (
                        <CombinedDataRow
                          key={row.label}
                          label={`Δ ${row.label}`}
                          yearlyValues={allDeltas.map((d) => d[rowIdx].yearlyValue)}
                          monthlyValues={allDeltas.map((d) => d[rowIdx].monthlyValue)}
                          yearlyTooltips={allDeltas.map((d) => d[rowIdx].yearlyTooltip!)}
                          monthlyTooltips={allDeltas.map((d) => d[rowIdx].monthlyTooltip!)}
                          percentages={allDeltas.map((d) => d[rowIdx].percentage!)}
                          highlight={true}
                          delta={true}
                          showSecondary={showSecondary}
                          showDash={isCurrentOffer}
                        />
                      );
                    })}
                  </tbody>
                  {hasPrivate && (
                    <>
                      <tbody>
                        <SectionHeader
                          title="EV-Adjusted"
                          colSpan={colSpan}
                          open={showEVDelta}
                          onToggle={() => setShowEVDelta(!showEVDelta)}
                          tooltip="Difference with private company equity valued at reduced multiples"
                        />
                      </tbody>
                      {showEVDelta && (
                        <tbody>
                          {allEVDeltas[0].map((_row, rowIdx) => {
                            const row = allEVDeltas[0][rowIdx];
                            return (
                              <CombinedDataRow
                                key={row.label}
                                label={`Δ ${row.label}`}
                                yearlyValues={allEVDeltas.map((d) => d[rowIdx].yearlyValue)}
                                monthlyValues={allEVDeltas.map((d) => d[rowIdx].monthlyValue)}
                                yearlyTooltips={allEVDeltas.map((d) => d[rowIdx].yearlyTooltip!)}
                                monthlyTooltips={allEVDeltas.map((d) => d[rowIdx].monthlyTooltip!)}
                                percentages={allEVDeltas.map((d) => d[rowIdx].percentage!)}
                                highlight={true}
                                delta={true}
                                showSecondary={showSecondary}
                                showDash={isCurrentOffer}
                              />
                            );
                          })}
                        </tbody>
                      )}
                    </>
                  )}
                </>
              )}
            </>
          );
        })()}

        {/* Notes — collapsible, collapsed by default */}
        <tbody>
          <SectionHeader
            title="Notes"
            colSpan={colSpan}
            open={showNotes}
            onToggle={() => setShowNotes(!showNotes)}
          />
        </tbody>
        {showNotes && (
          <tbody>
            <tr className="border-t">
              <td className="px-4 py-2 text-sm font-medium whitespace-nowrap align-top">Notes</td>
              {offers.map((o) => (
                <td key={o.id} className="px-4 py-2 text-sm align-top whitespace-pre-wrap break-words max-w-0">
                  {o.notes || <span className="text-muted-foreground">—</span>}
                </td>
              ))}
            </tr>
          </tbody>
        )}
      </table>
      <p className="px-4 py-2 text-xs text-muted-foreground border-t">
        All values are post-tax. Hover any <span className="border-b border-dotted border-muted-foreground">dotted-underlined</span> value to see the pre-tax amount.
      </p>
    </div>
  );
}
