import { useState } from 'react';
import { useAppState } from '@/lib/app-context';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { X } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  SUPPORTED_STATES,
  STATE_TAX_DATA,
  RETIREMENT_401K_LIMIT,
} from '@/lib/tax-brackets';
import { ThemeSelector } from '@/components/theme-selector';

function EVMultipliersCard({
  multipliers,
  onChange,
}: {
  multipliers: number[];
  onChange: (multipliers: number[]) => void;
}) {
  const [inputValue, setInputValue] = useState('');
  const sorted = [...multipliers].sort((a, b) => a - b);

  function addMultiplier() {
    const num = parseFloat(inputValue);
    if (isNaN(num) || num < 0) return;
    if (multipliers.includes(num)) return;
    onChange([...multipliers, num].sort((a, b) => a - b));
    setInputValue('');
  }

  function removeMultiplier(value: number) {
    onChange(multipliers.filter((m) => m !== value));
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Private Company EV</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label>EV Multipliers</Label>
          <div className="flex flex-wrap gap-2">
            {sorted.map((m) => (
              <span
                key={m}
                className="inline-flex items-center gap-1 rounded-md bg-secondary px-2.5 py-1 text-sm font-medium"
              >
                {m}x
                <button
                  type="button"
                  onClick={() => removeMultiplier(m)}
                  className="ml-0.5 rounded-sm hover:bg-muted-foreground/20 p-0.5"
                >
                  <X className="h-3 w-3" />
                </button>
              </span>
            ))}
          </div>
          <div className="flex gap-2">
            <Input
              type="number"
              step="0.25"
              min={0}
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  addMultiplier();
                }
              }}
              placeholder="e.g. 1.5"
              className="w-32"
            />
            <Button type="button" variant="outline" size="sm" onClick={addMultiplier}>
              Add
            </Button>
          </div>
          <p className="text-xs text-muted-foreground">
            Equity value multipliers used for private company EV scenarios.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

export function SettingsPage() {
  const { state, updateSettings } = useAppState();
  const settings = state.settings;

  function update(patch: Partial<typeof settings>) {
    updateSettings({ ...settings, ...patch });
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Currency</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="mainCurrency">Main Currency</Label>
            <Input
              id="mainCurrency"
              value={settings.mainCurrency}
              onChange={(e) => update({ mainCurrency: e.target.value })}
              placeholder="USD"
            />
            <p className="text-xs text-muted-foreground">
              Currency label shown throughout the app (e.g. USD, EUR, GBP)
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="secondaryCurrency">Secondary Currency (optional)</Label>
            <Input
              id="secondaryCurrency"
              value={settings.secondaryCurrency}
              onChange={(e) => update({ secondaryCurrency: e.target.value })}
              placeholder="e.g. SGD"
            />
            <p className="text-xs text-muted-foreground">
              If set, a toggle to switch currencies will appear on the comparison table
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="conversionRate">Conversion Rate</Label>
            <Input
              id="conversionRate"
              type="number"
              step="0.01"
              min={0}
              value={settings.conversionRate ?? ''}
              onChange={(e) =>
                update({
                  conversionRate: e.target.value ? Number(e.target.value) : null,
                })
              }
              placeholder="e.g. 1.35"
            />
            <p className="text-xs text-muted-foreground">
              1 {settings.mainCurrency || 'main'} = X {settings.secondaryCurrency || 'secondary'}
            </p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Tax Settings</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="taxState">State</Label>
            <Select
              value={settings.taxState}
              onValueChange={(value) => update({ taxState: value })}
            >
              <SelectTrigger id="taxState">
                <SelectValue placeholder="Select state" />
              </SelectTrigger>
              <SelectContent>
                {SUPPORTED_STATES.map((stateCode) => (
                  <SelectItem key={stateCode} value={stateCode}>
                    {STATE_TAX_DATA[stateCode].name} ({stateCode})
                    {STATE_TAX_DATA[stateCode].hasNoIncomeTax && ' - No income tax'}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              State used for tax calculations. Includes federal + state + FICA taxes.
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="retirement401k">401(k) Contribution</Label>
            <Input
              id="retirement401k"
              type="number"
              step="100"
              min={0}
              max={RETIREMENT_401K_LIMIT}
              value={settings.retirement401k || ''}
              onChange={(e) =>
                update({
                  retirement401k: e.target.value
                    ? Math.min(Number(e.target.value), RETIREMENT_401K_LIMIT)
                    : 0,
                })
              }
              placeholder="0"
            />
            <p className="text-xs text-muted-foreground">
              Annual 401(k) contribution (max ${RETIREMENT_401K_LIMIT.toLocaleString()} for 2025).
              Reduces federal and state taxable income, but not FICA.
            </p>
          </div>
        </CardContent>
      </Card>

      <EVMultipliersCard
        multipliers={settings.evMultipliers}
        onChange={(evMultipliers) => update({ evMultipliers })}
      />

      <Card>
        <CardHeader>
          <CardTitle>Appearance</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <Label>Theme</Label>
          <ThemeSelector value={settings.theme} onChange={(theme) => update({ theme })} />
          <p className="text-xs text-muted-foreground">
            Choose your preferred color scheme.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
