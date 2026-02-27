"use client";

import { useState, useRef, useEffect } from "react";
import { Send, Sparkles, User, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AIBadge } from "@/components/ai-badge";
import { cn } from "@/lib/utils";
import { chatWithContract, suggestedQuestions, type ContractTerms, type Clause, type ChatResponse } from "@/lib/mock-llm";

interface ContractChatProps {
  terms: ContractTerms;
  clauses: Clause[];
}

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  citations?: ChatResponse["citations"];
}

export function ContractChat({ terms, clauses }: ContractChatProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async (question?: string) => {
    const messageContent = question || input;
    if (!messageContent.trim()) return;

    const userMessage: Message = {
      id: `user-${Date.now()}`,
      role: "user",
      content: messageContent,
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 1000));

    const response = chatWithContract(messageContent, terms, clauses);

    const assistantMessage: Message = {
      id: `assistant-${Date.now()}`,
      role: "assistant",
      content: response.answer,
      citations: response.citations,
    };

    setMessages((prev) => [...prev, assistantMessage]);
    setIsLoading(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex flex-col h-[500px]">
      {/* Header */}
      <div className="flex items-center gap-2 pb-4 border-b border-border">
        <Sparkles className="h-5 w-5 text-ai" />
        <h3 className="text-lg font-semibold text-foreground">Ask the Contract</h3>
        <AIBadge />
      </div>

      {/* Messages area */}
      <div className="flex-1 overflow-y-auto py-4 space-y-4">
        {messages.length === 0 ? (
          <div className="space-y-4">
            <div className="text-center py-8">
              <Sparkles className="h-12 w-12 text-ai/30 mx-auto mb-3" />
              <p className="text-sm text-muted-foreground">
                Ask questions about this contract and get AI-powered answers with citations.
              </p>
            </div>

            {/* Suggested questions */}
            <div className="space-y-2">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                Suggested Questions
              </p>
              <div className="flex flex-wrap gap-2">
                {suggestedQuestions.map((question, index) => (
                  <button
                    key={index}
                    onClick={() => handleSend(question)}
                    className="text-left px-3 py-2 text-sm rounded-lg bg-secondary/50 border border-border hover:bg-secondary transition-colors text-foreground"
                  >
                    {question}
                  </button>
                ))}
              </div>
            </div>
          </div>
        ) : (
          messages.map((message) => (
            <div
              key={message.id}
              className={cn(
                "flex gap-3",
                message.role === "user" ? "justify-end" : "justify-start"
              )}
            >
              {message.role === "assistant" && (
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-ai/20 shrink-0">
                  <Sparkles className="h-4 w-4 text-ai" />
                </div>
              )}
              <div
                className={cn(
                  "max-w-[80%] rounded-lg p-3",
                  message.role === "user"
                    ? "bg-primary text-primary-foreground"
                    : "bg-secondary/50 border border-border"
                )}
              >
                <p className="text-sm leading-relaxed">{message.content}</p>
                
                {/* Citations */}
                {message.citations && message.citations.length > 0 && (
                  <div className="mt-3 pt-3 border-t border-border/50">
                    <p className="text-xs font-medium text-muted-foreground mb-2">
                      References:
                    </p>
                    <div className="space-y-1">
                      {message.citations.map((citation, index) => (
                        <div
                          key={index}
                          className="flex items-center gap-2 text-xs text-ai"
                        >
                          <FileText className="h-3 w-3" />
                          <span>
                            {citation.page} - {citation.section}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              {message.role === "user" && (
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/20 shrink-0">
                  <User className="h-4 w-4 text-primary" />
                </div>
              )}
            </div>
          ))
        )}

        {isLoading && (
          <div className="flex gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-ai/20 shrink-0">
              <Sparkles className="h-4 w-4 text-ai animate-pulse" />
            </div>
            <div className="bg-secondary/50 border border-border rounded-lg p-3">
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 bg-ai rounded-full animate-bounce" />
                <div className="h-2 w-2 bg-ai rounded-full animate-bounce [animation-delay:0.2s]" />
                <div className="h-2 w-2 bg-ai rounded-full animate-bounce [animation-delay:0.4s]" />
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input area */}
      <div className="pt-4 border-t border-border">
        <div className="flex gap-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask a question about this contract..."
            className="bg-secondary border-border"
            disabled={isLoading}
          />
          <Button onClick={() => handleSend()} disabled={!input.trim() || isLoading}>
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
