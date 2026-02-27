"use client";

import { useState, useEffect } from "react";
import { Copy, Check, Sparkles, Loader2, Lightbulb } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { AIBadge } from "@/components/ai-badge";
import { agentDraftEmail, type ContractTerms, type ContractInsights } from "@/lib/mock-llm";
import type { Contract } from "@/lib/seed-data";

interface RenewalAgentModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  contract: Contract;
  terms: ContractTerms;
  insights: ContractInsights;
}

export function RenewalAgentModal({
  open,
  onOpenChange,
  contract,
  terms,
  insights,
}: RenewalAgentModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState<{ subject: string; body: string } | null>(null);
  const [copied, setCopied] = useState(false);

  // Generate negotiation levers based on insights
  const negotiationLevers = [
    ...insights.negotiationSuggestions.slice(0, 3),
    insights.nonStandardTerms.length > 0
      ? `Address ${insights.nonStandardTerms.length} non-standard term(s) identified in current agreement`
      : null,
  ].filter(Boolean) as string[];

  useEffect(() => {
    if (open && !email) {
      setIsLoading(true);
      setTimeout(() => {
        const draft = agentDraftEmail("renewal", {
          contractName: contract.contractName,
          supplierName: contract.supplierName,
          endDate: new Date(contract.expiryDate).toLocaleDateString("en-US", {
            month: "long",
            day: "numeric",
            year: "numeric",
          }),
          enhancements: "expanded service scope and improved SLA targets",
          termsFocus: insights.nonStandardTerms.length > 0
            ? insights.nonStandardTerms.map((t) => t.term.toLowerCase()).join(", ")
            : "standard commercial terms",
        });
        setEmail(draft);
        setIsLoading(false);
      }, 1500);
    }
  }, [open, email, contract, insights]);

  useEffect(() => {
    if (!open) {
      setEmail(null);
      setCopied(false);
    }
  }, [open]);

  const handleCopy = async () => {
    if (!email) return;
    const fullEmail = `Subject: ${email.subject}\n\n${email.body}`;
    await navigator.clipboard.writeText(fullEmail);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] bg-card border-border max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-ai" />
            <DialogTitle className="text-foreground">Renewal Agent</DialogTitle>
            <AIBadge />
          </div>
          <DialogDescription className="text-muted-foreground">
            AI-generated renewal outreach with recommended negotiation levers
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 pt-4">
          {/* Contract context */}
          <div className="grid grid-cols-2 gap-4">
            <div className="p-3 rounded-lg bg-secondary/50 border border-border">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">
                Contract
              </p>
              <p className="text-sm text-foreground font-medium">{contract.contractName}</p>
              <p className="text-xs text-muted-foreground">{contract.supplierName}</p>
            </div>
            <div className="p-3 rounded-lg bg-secondary/50 border border-border">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">
                Current Expiry
              </p>
              <p className="text-sm text-foreground font-medium">
                {new Date(contract.expiryDate).toLocaleDateString("en-US", {
                  month: "long",
                  day: "numeric",
                  year: "numeric",
                })}
              </p>
              <p className="text-xs text-muted-foreground">
                {Math.ceil(
                  (new Date(contract.expiryDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
                )}{" "}
                days remaining
              </p>
            </div>
          </div>

          {/* Negotiation levers */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Lightbulb className="h-4 w-4 text-ai" />
              <h4 className="text-sm font-medium text-foreground">Recommended Negotiation Levers</h4>
              <AIBadge />
            </div>
            <div className="space-y-2">
              {negotiationLevers.map((lever, index) => (
                <div
                  key={index}
                  className="flex items-start gap-3 p-3 rounded-lg bg-ai/5 border border-ai/10"
                >
                  <div className="flex h-5 w-5 items-center justify-center rounded-full bg-ai/20 text-xs font-medium text-ai shrink-0">
                    {index + 1}
                  </div>
                  <p className="text-sm text-foreground">{lever}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Email draft */}
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-12">
              <Loader2 className="h-8 w-8 text-ai animate-spin mb-3" />
              <p className="text-sm text-muted-foreground">Drafting renewal outreach...</p>
            </div>
          ) : email ? (
            <div className="space-y-4">
              <h4 className="text-sm font-medium text-foreground">Email Draft</h4>
              
              {/* Subject */}
              <div className="space-y-2">
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                  Subject
                </p>
                <div className="p-3 rounded-lg bg-secondary border border-border">
                  <p className="text-sm text-foreground font-medium">{email.subject}</p>
                </div>
              </div>

              {/* Body */}
              <div className="space-y-2">
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                  Body
                </p>
                <div className="p-4 rounded-lg bg-secondary border border-border max-h-[250px] overflow-y-auto">
                  <pre className="text-sm text-foreground whitespace-pre-wrap font-sans leading-relaxed">
                    {email.body}
                  </pre>
                </div>
              </div>
            </div>
          ) : null}

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4 border-t border-border">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Close
            </Button>
            <Button onClick={handleCopy} disabled={isLoading || !email}>
              {copied ? (
                <>
                  <Check className="mr-2 h-4 w-4" />
                  Copied!
                </>
              ) : (
                <>
                  <Copy className="mr-2 h-4 w-4" />
                  Copy to Clipboard
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
