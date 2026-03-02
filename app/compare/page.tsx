import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { GitCompare, ArrowLeft } from "lucide-react";

export default function ComparePage() {
  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-foreground">Comparison</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Compare contract versions side by side
        </p>
      </div>
      <Card className="border-border bg-card">
        <CardContent className="flex flex-col items-center justify-center gap-4 py-12">
          <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-primary/10">
            <GitCompare className="h-7 w-7 text-primary" />
          </div>
          <p className="text-muted-foreground text-center max-w-md">
            Use the contract detail page to compare versions. Open a contract from the Contracts Library and use the Compare action.
          </p>
          <Button asChild variant="outline">
            <Link href="/contracts">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Go to Contracts Library
            </Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
