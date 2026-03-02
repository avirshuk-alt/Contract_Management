"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Upload, FileText, X, Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { contractTypes, type ContractType, suppliers } from "@/lib/seed-data";
import type { ContractRecord } from "@/lib/types/contract";

const MAX_FILE_SIZE_BYTES = 100 * 1024 * 1024; // 100 MB
const ALLOWED_EXTENSIONS = [".pdf", ".docx"];

function isAllowedFile(file: File): boolean {
  const name = file.name.toLowerCase();
  return (
    file.type === "application/pdf" ||
    file.type === "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
    ALLOWED_EXTENSIONS.some((ext) => name.endsWith(ext))
  );
}

interface UploadModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: (contract: ContractRecord) => void;
}

export function UploadModal({ open, onOpenChange, onSuccess }: UploadModalProps) {
  const router = useRouter();
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState("");
  const [isDragOver, setIsDragOver] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [supplierName, setSupplierName] = useState("");
  const [contractType, setContractType] = useState<ContractType | "">("");
  const [contractName, setContractName] = useState("");

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile && isAllowedFile(droppedFile)) {
      if (droppedFile.size > MAX_FILE_SIZE_BYTES) {
        setError(`File must be under ${MAX_FILE_SIZE_BYTES / 1024 / 1024} MB`);
        return;
      }
      setError("");
      setFile(droppedFile);
    } else if (droppedFile) {
      setError("Only PDF and DOCX files are allowed");
    }
  }, []);

  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      if (!isAllowedFile(selectedFile)) {
        setError("Only PDF and DOCX files are allowed");
        setFile(null);
        return;
      }
      if (selectedFile.size > MAX_FILE_SIZE_BYTES) {
        setError(`File must be under ${MAX_FILE_SIZE_BYTES / 1024 / 1024} MB`);
        setFile(null);
        return;
      }
      setError("");
      setFile(selectedFile);
    }
  }, []);

  const handleSubmit = async () => {
    if (!file || !supplierName || !contractType || !contractName) return;

    setIsUploading(true);
    setError("");

    if (file.size > MAX_FILE_SIZE_BYTES) {
      setError(`File must be under ${MAX_FILE_SIZE_BYTES / 1024 / 1024} MB`);
      setIsUploading(false);
      return;
    }

    const formData = new FormData();
    formData.append("file", file);
    formData.append("contractName", contractName);
    formData.append("supplierName", supplierName);
    formData.append("contractType", contractType);
    formData.append("effectiveDate", new Date().toISOString().split("T")[0]);
    formData.append("expiryDate", new Date(Date.now() + 365 * 24 * 60 * 60 * 1000 * 3).toISOString().split("T")[0]);
    formData.append("value", String(Math.floor(Math.random() * 500000) + 100000));

    try {
      const res = await fetch("/api/contracts", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error ?? "Upload failed");
      }

      const newContract = await res.json();

      onOpenChange(false);
      setFile(null);
      setSupplierName("");
      setContractType("");
      setContractName("");

      onSuccess?.(newContract);
      router.push(`/contracts/${newContract.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setIsUploading(false);
    }
  };

  const isFormValid = file && supplierName && contractType && contractName;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] bg-card border-border">
        <DialogHeader>
          <DialogTitle className="text-foreground">Upload Contract</DialogTitle>
          <DialogDescription className="text-muted-foreground">
            Upload a PDF or DOCX contract for AI-powered analysis and insights generation.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 pt-4">
          {error && (
            <div className="p-3 rounded-lg bg-destructive/10 text-destructive text-sm">
              {error}
            </div>
          )}
          {/* File upload area */}
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={`relative border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
              isDragOver
                ? "border-primary bg-primary/5"
                : file
                ? "border-success bg-success/5"
                : "border-border hover:border-muted-foreground/50"
            }`}
          >
            {file ? (
              <div className="flex items-center justify-center gap-3">
                <FileText className="h-8 w-8 text-success" />
                <div className="text-left">
                  <p className="text-sm font-medium text-foreground">{file.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {(file.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="ml-auto"
                  onClick={() => setFile(null)}
                  disabled={isUploading}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ) : (
              <>
                <Upload className="mx-auto h-10 w-10 text-muted-foreground" />
                <p className="mt-2 text-sm text-foreground">
                  Drag and drop your PDF or DOCX here, or{" "}
                  <label className="text-primary hover:underline cursor-pointer">
                    browse
                    <input
                      type="file"
                      accept=".pdf,.docx"
                      onChange={handleFileChange}
                      className="sr-only"
                    />
                  </label>
                </p>
                <p className="mt-1 text-xs text-muted-foreground">PDF or DOCX, max 100 MB</p>
              </>
            )}
          </div>

          {/* Contract details */}
          <div className="space-y-3">
            <div className="space-y-2">
              <Label htmlFor="contractName" className="text-foreground">
                Contract Name
              </Label>
              <Input
                id="contractName"
                placeholder="e.g., IT Services Agreement 2025"
                value={contractName}
                onChange={(e) => setContractName(e.target.value)}
                className="bg-secondary border-border"
                disabled={isUploading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="supplierName" className="text-foreground">
                Supplier Name
              </Label>
              <Input
                id="supplierName"
                placeholder="e.g., Apex Supply Co."
                value={supplierName}
                onChange={(e) => setSupplierName(e.target.value)}
                list="suppliers"
                className="bg-secondary border-border"
                disabled={isUploading}
              />
              <datalist id="suppliers">
                {suppliers.map((s) => (
                  <option key={s.id} value={s.name} />
                ))}
              </datalist>
            </div>

            <div className="space-y-2">
              <Label htmlFor="contractType" className="text-foreground">
                Contract Type
              </Label>
              <Select
                value={contractType}
                onValueChange={(v) => setContractType(v as ContractType)}
                disabled={isUploading}
              >
                <SelectTrigger className="bg-secondary border-border">
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  {contractTypes.map((type) => (
                    <SelectItem key={type} value={type}>
                      {type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isUploading}
            >
              Cancel
            </Button>
            <Button onClick={handleSubmit} disabled={!isFormValid || isUploading}>
              {isUploading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Analyzing...
                </>
              ) : (
                <>
                  <Upload className="mr-2 h-4 w-4" />
                  Upload & Analyze
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
