import { Link } from "react-router-dom";
import { useAppState } from "@/lib/app-context";
import { ComparisonTable } from "@/components/comparison-table";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

export function ComparePage() {
  const { state } = useAppState();

  if (state.offers.length < 2) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <p className="text-lg">Need at least 2 offers to compare</p>
        <Button variant="outline" className="mt-4" asChild>
          <Link to="/">
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back to Offers
          </Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Compare</h1>
      <ComparisonTable />
    </div>
  );
}
