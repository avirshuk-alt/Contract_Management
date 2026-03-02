"use client";

import { useState, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Upload, FileText, X, Loader2, Sparkles } from "lucide-react";
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
import { Badge } from "@/components/ui/badge";
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

function getContractNameFromFile(file: File, prefix?: string): string {
  const base = file.name.replace(/\.[^.]+$/, "") || file.name;
  return prefix?.trim() ? `${prefix.trim()} - ${base}` : base;
}

function formatFileSize(bytes: number): string {
  if (bytes >= 1024 * 1024) return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
  return `${(bytes / 1024).toFixed(1)} KB`;
}

interface UploadModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: (contract: ContractRecord | ContractRecord[]) => void;
}

export function UploadModal({ open, onOpenChange, onSuccess }: UploadModalProps) {
  const router = useRouter();
  const [isUploading, setIsUploading] = useState(false);
  const [isExtracting, setIsExtracting] = useState(false);
  const [uploadProgress, setUploadProgress] = useState({ current: 0, total: 0 });
  const [error, setError] = useState("");
  const [isDragOver, setIsDragOver] = useState(false);
  const [files, setFiles] = useState<File[]>([]);
  const [supplierName, setSupplierName] = useState("");
  const [contractType, setContractType] = useState<ContractType | "">("");
  const [contractName, setContractName] = useState("");
  const [namePrefix, setNamePrefix] = useState("");
  const [effectiveDate, setEffectiveDate] = useState("");
  const [expiryDate, setExpiryDate] = useState("");

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const addFiles = useCallback((newFiles: FileList | File[]) => {
    const arr = Array.from(newFiles);
    const allowed: File[] = [];
    for (const f of arr) {
      if (isAllowedFile(f)) {
        if (f.size > MAX_FILE_SIZE_BYTES) continue;
        allowed.push(f);
      }
    }
    if (allowed.length > 0) {
      setFiles((prev) => {
        const seen = new Set(prev.map((p) => p.name + p.size));
        for (const f of allowed) {
          if (!seen.has(f.name + f.size)) {
            seen.add(f.name + f.size);
            prev = [...prev, f];
          }
        }
        return prev;
      });
      setError("");
    }
    if (arr.length > 0 && allowed.length === 0) {
      setError("Only PDF and DOCX files are allowed (max 100 MB each)");
    }
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragOver(false);
      addFiles(e.dataTransfer.files);
    },
    [addFiles]
  );

  const handleFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const selected = e.target.files;
      if (selected?.length) {
        addFiles(selected);
      }
      e.target.value = "";
    },
    [addFiles]
  );

  const removeFile = useCallback((index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  }, []);

  const clearFiles = useCallback(() => {
    setFiles([]);
  }, []);

  // Extract metadata from first PDF when files change
  const firstFileKey = files[0] ? `${files[0].name}-${files[0].size}` : "";
  useEffect(() => {
    if (files.length === 0 || isExtracting || isUploading) return;

    const firstPdf = files.find((f) => f.type === "application/pdf");
    if (!firstPdf) {
      const first = files[0];
      setContractName(first?.name.replace(/\.[^.]+$/, "").replace(/[-_]/g, " ") ?? "");
      return;
    }

    const abort = new AbortController();
    setIsExtracting(true);
    const fd = new FormData();
    fd.append("file", firstPdf);

    fetch("/api/extract/metadata", {
      method: "POST",
      body: fd,
      signal: abort.signal,
    })
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (!data) return;
        if (data.contractName) setContractName(data.contractName);
        if (data.supplierName) setSupplierName(data.supplierName);
        if (data.contractType && contractTypes.includes(data.contractType))
          setContractType(data.contractType);
        if (data.effectiveDate) setEffectiveDate(data.effectiveDate);
        if (data.expiryDate) setExpiryDate(data.expiryDate);
      })
      .catch(() => {})
      .finally(() => setIsExtracting(false));

    return () => abort.abort();
    // eslint-disable-next-line react-hooks/exhaustive-deps -- firstFileKey drives when to extract
  }, [firstFileKey]);

  const handleSubmit = async () => {
    if (files.length === 0 || !supplierName || !contractType) return;

    const singleFile = files.length === 1;
    if (singleFile && !contractName && !namePrefix) {
      setError("Contract name is required for single file upload");
      return;
    }

    setIsUploading(true);
    setError("");
    setUploadProgress({ current: 0, total: files.length });

    const defaultEffective = effectiveDate || new Date().toISOString().split("T")[0];
    const defaultExpiry =
      expiryDate ||
      new Date(Date.now() + 365 * 24 * 60 * 60 * 1000 * 3).toISOString().split("T")[0];

    const getContractName = (file: File) =>
      singleFile && contractName ? contractName : getContractNameFromFile(file, namePrefix);
    const successful: ContractRecord[] = [];
    let lastError = "";

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      setUploadProgress({ current: i + 1, total: files.length });

      const formData = new FormData();
      formData.append("file", file);
      formData.append("contractName", getContractName(file));
      formData.append("supplierName", supplierName);
      formData.append("contractType", contractType);
      formData.append("effectiveDate", defaultEffective);
      formData.append("expiryDate", defaultExpiry);
      formData.append("value", String(Math.floor(Math.random() * 500000) + 100000));

      try {
        const res = await fetch("/api/contracts", {
          method: "POST",
          body: formData,
        });

        if (!res.ok) {
          const data = await res.json().catch(async () => {
            const text = await res.text();
            return { error: text || `Server error (${res.status})` };
          });
          const errMsg =
            typeof data?.error === "string"
              ? data.error
              : data?.error && typeof data.error === "object"
                ? (data.error as { formErrors?: string[]; fieldErrors?: Record<string, string[]> })
                    .formErrors?.[0] ||
                  Object.values(
                    (data.error as { fieldErrors?: Record<string, string[]> }).fieldErrors ?? {}
                  )
                    .flat()[0] ||
                  "Upload failed"
                : "Upload failed";
          lastError = `${file.name}: ${errMsg}`;
          continue;
        }

        const newContract = await res.json();
        successful.push(newContract);
      } catch (err) {
        lastError = `${file.name}: ${err instanceof Error ? err.message : "Upload failed"}`;
      }
    }

    setIsUploading(false);
    setUploadProgress({ current: 0, total: 0 });

    if (successful.length > 0) {
      onOpenChange(false);
      setFiles([]);
      setSupplierName("");
      setContractType("");
      setContractName("");
      setNamePrefix("");
      setEffectiveDate("");
      setExpiryDate("");

      onSuccess?.(successful.length === 1 ? successful[0] : successful);

      if (successful.length === 1) {
        router.push(`/contracts/${successful[0].id}`);
      } else {
        router.refresh();
      }
    }

    if (successful.length < files.length) {
      setError(
        lastError
          ? `Some uploads failed. ${successful.length} succeeded, ${files.length - successful.length} failed. Last error: ${lastError}`
          : "One or more uploads failed"
      );
    }
  };

  const isMulti = files.length > 1;
  const isFormValid =
    files.length > 0 &&
    supplierName &&
    contractType &&
    (isMulti ? true : contractName || namePrefix);

  const totalSize = files.reduce((s, f) => s + f.size, 0);
  const fileSummary =
    files.length <= 3
      ? files.map((f) => f.name).join(", ")
      : `${files[0].name}, ${files[1].name} +${files.length - 2} more`;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] bg-card border-border">
        <DialogHeader>
          <DialogTitle className="text-foreground">Upload Contract{isMulti ? "s" : ""}</DialogTitle>
          <DialogDescription className="text-muted-foreground">
            Upload PDF or DOCX contract(s). Metadata is extracted from the first file when possible.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 pt-4">
          {error && (
            <div className="p-3 rounded-lg bg-destructive/10 text-destructive text-sm">{error}</div>
          )}

          {/* File upload area - compact */}
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={`relative border-2 border-dashed rounded-lg p-4 transition-colors ${
              isDragOver
                ? "border-primary bg-primary/5"
                : files.length > 0
                  ? "border-success/50 bg-success/5"
                  : "border-border hover:border-muted-foreground/50"
            }`}
          >
            {files.length > 0 ? (
              <div className="flex flex-col gap-3">
                <div className="flex items-center gap-2 flex-wrap">
                  <div className="flex items-center gap-2 min-w-0">
                    <FileText className="h-5 w-5 text-muted-foreground shrink-0" />
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-foreground truncate" title={fileSummary}>
                        {fileSummary}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {files.length} file{files.length !== 1 ? "s" : ""} · {formatFileSize(totalSize)}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 ml-auto shrink-0">
                    <Badge variant="secondary" className="font-normal">
                      {files.length}
                    </Badge>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={clearFiles}
                      disabled={isUploading}
                      className="h-7 px-2 text-muted-foreground hover:text-foreground"
                    >
                      Clear
                    </Button>
                    <label className="cursor-pointer">
                      <span className="text-xs text-primary hover:underline">Add more</span>
                      <input
                        type="file"
                        accept=".pdf,.docx"
                        multiple
                        onChange={handleFileChange}
                        className="sr-only"
                      />
                    </label>
                  </div>
                </div>
                {files.length > 1 && (
                  <div className="flex flex-wrap gap-1 max-h-16 overflow-y-auto">
                    {files.map((f, i) => (
                      <Badge
                        key={`${f.name}-${f.size}-${i}`}
                        variant="outline"
                        className="text-xs font-normal py-1 gap-1 pr-1"
                      >
                        <span className="truncate max-w-[120px]">{f.name}</span>
                        <button
                          type="button"
                          onClick={() => removeFile(i)}
                          disabled={isUploading}
                          className="rounded hover:bg-muted p-0.5"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <>
                <Upload className="mx-auto h-10 w-10 text-muted-foreground" />
                <p className="mt-2 text-sm text-foreground">
                  Drag and drop PDF or DOCX here, or{" "}
                  <label className="text-primary hover:underline cursor-pointer">
                    browse
                    <input
                      type="file"
                      accept=".pdf,.docx"
                      multiple
                      onChange={handleFileChange}
                      className="sr-only"
                    />
                  </label>
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  PDF or DOCX, max 100 MB each. Multiple files supported.
                </p>
              </>
            )}
          </div>

          {/* Contract details */}
          <div className="space-y-3">
            {(isExtracting || isUploading) && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" />
                {isExtracting ? (
                  <>
                    <Sparkles className="h-4 w-4" />
                    Extracting metadata from contract...
                  </>
                ) : (
                  <>
                    {uploadProgress.total > 1
                      ? `Uploading ${uploadProgress.current} of ${uploadProgress.total}...`
                      : "Analyzing..."}
                  </>
                )}
              </div>
            )}

            {isMulti ? (
              <div className="space-y-2">
                <Label htmlFor="namePrefix" className="text-foreground">
                  Name prefix (optional)
                </Label>
                <Input
                  id="namePrefix"
                  placeholder="e.g., Acme Agreement"
                  value={namePrefix}
                  onChange={(e) => setNamePrefix(e.target.value)}
                  className="bg-secondary border-border"
                  disabled={isUploading}
                />
              </div>
            ) : (
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
            )}

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

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label htmlFor="effectiveDate" className="text-foreground">
                  Effective Date
                </Label>
                <Input
                  id="effectiveDate"
                  type="date"
                  value={effectiveDate}
                  onChange={(e) => setEffectiveDate(e.target.value)}
                  className="bg-secondary border-border"
                  disabled={isUploading}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="expiryDate" className="text-foreground">
                  Expiry Date
                </Label>
                <Input
                  id="expiryDate"
                  type="date"
                  value={expiryDate}
                  onChange={(e) => setExpiryDate(e.target.value)}
                  className="bg-secondary border-border"
                  disabled={isUploading}
                />
              </div>
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
            <Button onClick={handleSubmit} disabled={!isFormValid || isUploading || isExtracting}>
              {isUploading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {uploadProgress.total > 1
                    ? `Uploading ${uploadProgress.current}/${uploadProgress.total}`
                    : "Analyzing..."}
                </>
              ) : (
                <>
                  <Upload className="mr-2 h-4 w-4" />
                  Upload {files.length > 1 ? `${files.length} Contracts` : "& Analyze"}
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
