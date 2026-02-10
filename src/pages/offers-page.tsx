import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAppState } from '@/lib/app-context';
import { encodeShareUrl } from '@/lib/share';
import { OfferCard } from '@/components/offer-card';
import { Button } from '@/components/ui/button';
import { Plus, Share2 } from 'lucide-react';

export function OffersPage() {
  const { state } = useAppState();
  const [copied, setCopied] = useState(false);

  async function handleShare() {
    try {
      const url = encodeShareUrl(state);
      if (navigator.clipboard) {
        await navigator.clipboard.writeText(url);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } else {
        prompt('Copy this share URL:', url);
      }
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to create share link');
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Offers</h1>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleShare}
            disabled={state.offers.length === 0}
          >
            <Share2 className="h-4 w-4 mr-1" />
            {copied ? 'Copied!' : 'Share'}
          </Button>
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
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {state.offers.map((offer) => (
            <OfferCard key={offer.id} offer={offer} />
          ))}
        </div>
      )}
    </div>
  );
}
