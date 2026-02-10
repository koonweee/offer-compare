import { Link } from 'react-router-dom';
import type { Offer } from '@/lib/types';
import { useAppState } from '@/lib/app-context';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Pencil, Trash2, Copy } from 'lucide-react';

interface OfferCardProps {
  offer: Offer;
}

export function OfferCard({ offer }: OfferCardProps) {
  const { deleteOffer, duplicateOffer, state } = useAppState();
  const currency = state.settings.mainCurrency;

  return (
    <Card className="group transition-all duration-300 hover:shadow-lg hover:border-primary/20 flex flex-col h-full">
      <CardHeader className="pb-3 flex-1">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <CardTitle className="text-xl font-bold tracking-tight group-hover:text-primary transition-colors">
              {offer.name}
            </CardTitle>
            <p className="text-base font-medium text-muted-foreground font-mono">
              {currency} {offer.baseSalary.toLocaleString()} <span className="text-xs text-muted-foreground/60 font-sans font-normal">base</span>
            </p>
          </div>
          <div className="flex flex-col items-end gap-1.5">
             {offer.isCurrent && (
                <Badge variant="secondary" className="bg-emerald-100 text-emerald-950 border border-emerald-200 dark:bg-emerald-900/40 dark:text-emerald-300 dark:border-emerald-800 hover:bg-emerald-200">
                    Current
                </Badge>
             )}
             {offer.isPrivateCompany && <Badge variant="outline" className="text-xs">Private</Badge>}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex gap-2 pt-2 border-t mt-2 opacity-60 group-hover:opacity-100 transition-opacity">
          <Button variant="ghost" size="sm" className="h-8 px-2 text-muted-foreground hover:text-foreground" asChild>
            <Link to={`/offer/${offer.id}`}>
              <Pencil className="h-3.5 w-3.5 mr-1.5" />
              Edit
            </Link>
          </Button>
          <Button variant="ghost" size="sm" className="h-8 px-2 text-muted-foreground hover:text-foreground" onClick={() => duplicateOffer(offer.id)}>
            <Copy className="h-3.5 w-3.5 mr-1.5" />
            Duplicate
          </Button>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="ghost" size="sm" className="h-8 px-2 text-muted-foreground hover:text-destructive ml-auto">
                <Trash2 className="h-3.5 w-3.5" />
                <span className="sr-only">Delete</span>
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete "{offer.name}"?</AlertDialogTitle>
                <AlertDialogDescription>
                  This action cannot be undone. This will permanently delete this offer.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={() => deleteOffer(offer.id)} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">Delete</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </CardContent>
    </Card>
  );
}
