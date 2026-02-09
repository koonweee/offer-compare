import { useRef } from 'react';
import { Link } from 'react-router-dom';
import { useAppState } from '@/lib/app-context';
import { exportState, importState } from '@/lib/storage';
import { OfferCard } from '@/components/offer-card';
import { Button } from '@/components/ui/button';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Plus, Download, Upload } from 'lucide-react';
import { useState } from 'react';

export function OffersPage() {
  const { state, replaceState } = useAppState();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [importConfirm, setImportConfirm] = useState(false);
  const [pendingState, setPendingState] = useState<typeof state | null>(null);

  async function handleImport(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const imported = await importState(file);
      setPendingState(imported);
      setImportConfirm(true);
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Import failed');
    }
    // Reset so the same file can be re-selected
    e.target.value = '';
  }

  function confirmImport() {
    if (pendingState) {
      replaceState(pendingState);
      setPendingState(null);
    }
    setImportConfirm(false);
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Offers</h1>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => exportState(state)}>
            <Download className="h-4 w-4 mr-1" />
            Export
          </Button>
          <Button variant="outline" size="sm" onClick={() => fileInputRef.current?.click()}>
            <Upload className="h-4 w-4 mr-1" />
            Import
          </Button>
          <input ref={fileInputRef} type="file" accept=".json" className="hidden" onChange={handleImport} />
          <Button size="sm" asChild>
            <Link to="/offer/new">
              <Plus className="h-4 w-4 mr-1" />
              Add Offer
            </Link>
          </Button>
        </div>
      </div>

      {state.offers.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          <p className="text-lg">No offers yet</p>
          <p className="text-sm mt-1">Add your first offer to get started.</p>
        </div>
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {state.offers.map((offer) => (
              <OfferCard key={offer.id} offer={offer} />
            ))}
          </div>
        </>
      )}

      <AlertDialog open={importConfirm} onOpenChange={setImportConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Import Data</AlertDialogTitle>
            <AlertDialogDescription>
              This will replace all current offers and settings with the imported data. This cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmImport}>Replace</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
