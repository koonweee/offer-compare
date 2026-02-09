import { useAppState } from '@/lib/app-context';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
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

export function SettingsPage() {
  const { state, updateSettings } = useAppState();
  const settings = state.settings;

  function update(patch: Partial<typeof settings>) {
    updateSettings({ ...settings, ...patch });
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Settings</h1>
        <Button variant="outline" size="sm" asChild>
          <Link to="/">
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back
          </Link>
        </Button>
      </div>

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
