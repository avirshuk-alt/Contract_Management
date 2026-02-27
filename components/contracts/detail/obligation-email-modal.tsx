"use client";

import { useState, useEffect } from "react";
import { Copy, Check, Sparkles, Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { AIBadge } from "@/components/ai-badge";
import { agentDraftEmail, type Obligation } from "@/lib/mock-llm";

interface ObligationEmailModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  obligation: Obligation;
  supplierName: string;
}

export function ObligationEmailModal({
  open,
  onOpenChange,
  obligation,
  supplierName,
}: ObligationEmailModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState<{ subject: string; body: string } | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (open && !email) {
      setIsLoading(true);
      // Simulate API delay
      setTimeout(() => {
        const draft = agentDraftEmail("obligation-followup", {
          obligation: obligation.obligation,
          dueDate: new Date(obligation.dueDate).toLocaleDateString("en-US", {
            month: "long",
            day: "numeric",
            year: "numeric",
          }),
          status: obligation.status,
          supplierName,
        });
        setEmail(draft);
        setIsLoading(false);
      }, 1500);
    }
  }, [open, email, obligation, supplierName]);

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
      <DialogContent className="sm:max-w-[600px] bg-card border-border">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-ai" />
            <DialogTitle className="text-foreground">
              Draft Follow-up Email
            </DialogTitle>
            <AIBadge />
          </div>
          <DialogDescription className="text-muted-foreground">
            AI-generated email draft for obligation follow-up
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 pt-4">
          {/* Obligation context */}
          <div className="p-3 rounded-lg bg-secondary/50 border border-border">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">
              Regarding
            </p>
            <p className="text-sm text-foreground">{obligation.obligation}</p>
            <p className="text-xs text-muted-foreground mt-1">
              Due: {new Date(obligation.dueDate).toLocaleDateString()}
            </p>
          </div>

          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-12">
              <Loader2 className="h-8 w-8 text-ai animate-spin mb-3" />
              <p className="text-sm text-muted-foreground">Drafting email...</p>
            </div>
          ) : email ? (
            <div className="space-y-4">
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
                <div className="p-4 rounded-lg bg-secondary border border-border max-h-[300px] overflow-y-auto">
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
