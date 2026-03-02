import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Lightbulb, ArrowLeft } from "lucide-react";

export default function OpportunitiesPage() {
  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-foreground">Opportunities</h1>
        <p className="text-sm text-muted-foreground mt-1">
          AI-identified opportunities and recommendations
        </p>
      </div>
      <Card className="border-border bg-card">
        <CardContent className="flex flex-col items-center justify-center gap-4 py-12">
          <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-primary/10">
            <Lightbulb className="h-7 w-7 text-primary" />
          </div>
          <p className="text-muted-foreground text-center max-w-md">
            Opportunities and recommendations will appear here. Explore contracts and dashboard insights in the meantime.
          </p>
          <Button asChild variant="outline">
            <Link href="/">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Return to Home
            </Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
