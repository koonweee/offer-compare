import { useEffect, useState } from 'react';
import { useAppState } from '@/lib/app-context';
import { getShareDataFromUrl, decodeShareData, clearShareHash } from '@/lib/share';
import type { AppState } from '@/lib/types';
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

export function ShareImportHandler() {
  const { replaceState } = useAppState();
  const [pendingState, setPendingState] = useState<AppState | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const encoded = getShareDataFromUrl();
    if (!encoded) return;

    try {
      const decoded = decodeShareData(encoded);
      setPendingState(decoded);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load shared data');
    }
  }, []);

  function handleConfirm() {
    if (pendingState) {
      replaceState(pendingState);
    }
    setPendingState(null);
    clearShareHash();
  }

  function handleCancel() {
    setPendingState(null);
    clearShareHash();
  }

  function handleErrorDismiss() {
    setError(null);
    clearShareHash();
  }

  return (
    <>
      <AlertDialog open={pendingState !== null} onOpenChange={(open) => { if (!open) handleCancel(); }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Import Shared Offers</AlertDialogTitle>
            <AlertDialogDescription>
              Someone shared {pendingState?.offers.length ?? 0} offer{(pendingState?.offers.length ?? 0) !== 1 ? 's' : ''} with you
              {pendingState && pendingState.offers.length > 0 && (
                <>: {pendingState.offers.map((o) => o.name).join(', ')}</>
              )}
              . This will replace all your current offers and settings.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={handleCancel}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirm}>Import</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={error !== null} onOpenChange={(open) => { if (!open) handleErrorDismiss(); }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Invalid Share Link</AlertDialogTitle>
            <AlertDialogDescription>{error}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction onClick={handleErrorDismiss}>OK</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
