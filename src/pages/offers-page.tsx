import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAppState } from '@/lib/app-context';
import { encodeShareUrl } from '@/lib/share';
import { OfferCard } from '@/components/offer-card';
import { Button } from '@/components/ui/button';
import { Plus, Share2, FileText } from 'lucide-react';

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
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Offers</h1>
          <p className="text-muted-foreground mt-1">Manage and compare your job offers.</p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleShare}
            disabled={state.offers.length === 0}
            className="hidden sm:flex"
          >
            <Share2 className="h-4 w-4 mr-2" />
            {copied ? 'Copied!' : 'Share'}
          </Button>
          <Button size="sm" asChild className="shadow-sm">
            <Link to="/offer/new">
              <Plus className="h-4 w-4 mr-2" />
              Add Offer
            </Link>
          </Button>
        </div>
      </div>

      {state.offers.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center border-2 border-dashed rounded-xl bg-muted/30">
          <div className="bg-muted p-4 rounded-full mb-4">
             <FileText className="h-8 w-8 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-semibold">No offers created yet</h3>
          <p className="text-muted-foreground max-w-sm mt-2 mb-6">
            Add your first job offer to start visualizing and comparing your compensation packages.
          </p>
          <Button asChild>
             <Link to="/offer/new">
              <Plus className="h-4 w-4 mr-2" />
              Add First Offer
            </Link>
          </Button>
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {state.offers.map((offer) => (
            <OfferCard key={offer.id} offer={offer} />
          ))}
        </div>
      )}
    </div>
  );
}
