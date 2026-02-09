import { useParams } from 'react-router-dom';
import { useAppState } from '@/lib/app-context';
import { OfferForm } from '@/components/offer-form';

export function OfferFormPage() {
  const { id } = useParams<{ id: string }>();
  const { state, addOffer, updateOffer } = useAppState();

  const existing = id ? state.offers.find((o) => o.id === id) : undefined;

  if (id && !existing) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <p className="text-lg">Offer not found</p>
      </div>
    );
  }

  return (
    <OfferForm
      key={id ?? 'new'}
      initial={existing}
      onSubmit={existing ? updateOffer : addOffer}
    />
  );
}
