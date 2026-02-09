import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import type { Offer } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface OfferFormProps {
  initial?: Offer;
  onSubmit: (offer: Offer) => void;
}

function makeDefaultOffer(): Offer {
  return {
    id: crypto.randomUUID(),
    name: '',
    baseSalary: 0,
    bonus: { type: 'percentage', value: 0 },
    equity: {
      totalValue: 0,
      years: 4,
      vestingSchedule: [25, 25, 25, 25],
    },
    signOn: 0,
    notes: '',
    isCurrent: false,
    isPrivateCompany: false,
  };
}

export function OfferForm({ initial, onSubmit }: OfferFormProps) {
  const navigate = useNavigate();
  const [offer, setOffer] = useState<Offer>(initial ?? makeDefaultOffer());
  const [errors, setErrors] = useState<Record<string, string>>({});

  function update(patch: Partial<Offer>) {
    setOffer((prev) => ({ ...prev, ...patch }));
  }

  function updateEquity(patch: Partial<Offer['equity']>) {
    setOffer((prev) => ({
      ...prev,
      equity: { ...prev.equity, ...patch },
    }));
  }

  function handleYearsChange(years: number) {
    const clamped = Math.max(1, Math.min(10, years));
    const schedule = Array.from({ length: clamped }, () =>
      Math.round(100 / clamped)
    );
    // Fix rounding: make first element absorb the remainder
    const sum = schedule.reduce((a, b) => a + b, 0);
    if (sum !== 100) {
      schedule[0] += 100 - sum;
    }
    updateEquity({ years: clamped, vestingSchedule: schedule });
  }

  function handleScheduleChange(index: number, value: number) {
    const schedule = [...offer.equity.vestingSchedule];
    schedule[index] = value;
    updateEquity({ vestingSchedule: schedule });
  }

  function validate(): boolean {
    const errs: Record<string, string> = {};
    if (!offer.name.trim()) errs.name = 'Name is required';
    if (offer.baseSalary < 0) errs.baseSalary = 'Must be >= 0';
    const vestSum = offer.equity.vestingSchedule.reduce((a, b) => a + b, 0);
    if (vestSum !== 100) errs.vesting = `Vesting must sum to 100% (currently ${vestSum}%)`;
    setErrors(errs);
    return Object.keys(errs).length === 0;
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (validate()) {
      onSubmit(offer);
      navigate('/');
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle>{initial ? 'Edit Offer' : 'New Offer'}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Name *</Label>
            <Input
              id="name"
              value={offer.name}
              onChange={(e) => update({ name: e.target.value })}
              placeholder="e.g. Google L5"
            />
            {errors.name && <p className="text-sm text-destructive">{errors.name}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="baseSalary">Base Salary (Annual)</Label>
            <Input
              id="baseSalary"
              type="number"
              min={0}
              value={offer.baseSalary || ''}
              onChange={(e) => update({ baseSalary: Number(e.target.value) })}
            />
            {errors.baseSalary && <p className="text-sm text-destructive">{errors.baseSalary}</p>}
          </div>

          <div className="space-y-2">
            <Label>Bonus</Label>
            <div className="flex items-center gap-2">
              <select
                className="flex h-9 rounded-md border border-input bg-transparent px-3 py-1 text-sm"
                value={offer.bonus.type}
                onChange={(e) =>
                  update({
                    bonus: { ...offer.bonus, type: e.target.value as 'percentage' | 'amount' },
                  })
                }
              >
                <option value="percentage">% of Base</option>
                <option value="amount">Fixed Amount</option>
              </select>
              <Input
                type="number"
                min={0}
                value={offer.bonus.value || ''}
                onChange={(e) =>
                  update({ bonus: { ...offer.bonus, value: Number(e.target.value) } })
                }
                placeholder={offer.bonus.type === 'percentage' ? 'e.g. 15' : 'e.g. 30000'}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Equity</Label>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <Label htmlFor="equityTotal" className="text-xs text-muted-foreground">
                  Total Grant Value
                </Label>
                <Input
                  id="equityTotal"
                  type="number"
                  min={0}
                  value={offer.equity.totalValue || ''}
                  onChange={(e) => updateEquity({ totalValue: Number(e.target.value) })}
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="equityYears" className="text-xs text-muted-foreground">
                  Vesting Years
                </Label>
                <Input
                  id="equityYears"
                  type="number"
                  min={1}
                  max={10}
                  value={offer.equity.years}
                  onChange={(e) => handleYearsChange(Number(e.target.value))}
                />
              </div>
            </div>
            <div className="space-y-1">
              <Label className="text-xs text-muted-foreground">Vesting Schedule (%)</Label>
              <div className="flex gap-2">
                {offer.equity.vestingSchedule.map((pct, i) => (
                  <div key={i} className="flex-1">
                    <Label className="text-xs text-muted-foreground">Y{i + 1}</Label>
                    <Input
                      type="number"
                      min={0}
                      max={100}
                      value={pct}
                      onChange={(e) => handleScheduleChange(i, Number(e.target.value))}
                    />
                  </div>
                ))}
              </div>
              {errors.vesting && <p className="text-sm text-destructive">{errors.vesting}</p>}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="signOn">Sign-on Bonus</Label>
            <Input
              id="signOn"
              type="number"
              min={0}
              value={offer.signOn || ''}
              onChange={(e) => update({ signOn: Number(e.target.value) })}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              value={offer.notes}
              onChange={(e) => update({ notes: e.target.value })}
              placeholder="Any additional notes..."
              rows={3}
            />
          </div>

          <div className="flex items-center gap-6">
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={offer.isCurrent}
                onChange={(e) => update({ isCurrent: e.target.checked })}
                className="h-4 w-4 rounded border-input"
              />
              Current Job
            </label>
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={offer.isPrivateCompany}
                onChange={(e) => update({ isPrivateCompany: e.target.checked })}
                className="h-4 w-4 rounded border-input"
              />
              Private Company
            </label>
          </div>
        </CardContent>
      </Card>

      <div className="flex gap-3">
        <Button type="submit">{initial ? 'Save Changes' : 'Add Offer'}</Button>
        <Button type="button" variant="outline" onClick={() => navigate('/')}>
          Cancel
        </Button>
      </div>
    </form>
  );
}
