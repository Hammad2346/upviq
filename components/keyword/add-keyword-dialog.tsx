"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus } from "lucide-react";

interface AddKeywordDialogProps {
  open: boolean;
  onClose: () => void;
  onAdd: (keyword: string) => void;
}

export default function AddKeywordDialog({ open, onClose, onAdd }: AddKeywordDialogProps) {
  const [value, setValue] = useState("");
  const ready = value.trim().length > 0;

  function handleSubmit() {
    if (!ready) return;
    onAdd(value.trim());
    setValue("");
    onClose();
  }

  function handleClose() {
    setValue("");
    onClose();
  }

  return (
    <Dialog open={open} onOpenChange={(o) => { if (!o) handleClose(); }}>
      <DialogContent className="sm:max-w-md border-border p-0 overflow-hidden bg-white">
        {/* Gradient Line */}
        <div
          className="absolute top-0 left-0 right-0 h-px pointer-events-none"
          style={{ background: "var(--gradient-border)" }}
        />

        <div className="p-6 space-y-5">
          {/* Header */}
          <DialogHeader className="space-y-1">
            <DialogTitle
              className="text-lg font-bold text-foreground"
              style={{ fontFamily: "Arial, sans-serif" }}
            >
              Track new keyword
            </DialogTitle>
            <DialogDescription className="text-sm text-muted-foreground">
              Enter a keyword to monitor its demand, competition, and your ranking position.
            </DialogDescription>
          </DialogHeader>

          {/* Input Field */}
          <div className="space-y-2">
            <Label className="text-xs font-semibold tracking-widest uppercase text-muted-foreground">
              Keyword
            </Label>
            <Input
              autoFocus
              placeholder="e.g. react developer"
              value={value}
              onChange={(e) => setValue(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
              className="bg-gray-50 border-border text-foreground placeholder:text-muted-foreground focus-visible:ring-primary/20 rounded-xl h-10"
              style={{
                fontFamily: "JetBrains Mono, monospace",
                fontSize: "0.8rem",
              }}
            />
            <p className="text-xs text-muted-foreground">
              Use descriptive phrases like "react developer" or "ui/ux designer" for better signal accuracy.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-3 pt-1">
            <Button
              onClick={handleSubmit}
              disabled={!ready}
              className="flex-1 rounded-xl font-semibold text-sm h-9 transition-all duration-200 bg-primary text-primary-foreground hover:bg-primary/90 disabled:bg-gray-200 disabled:text-muted-foreground"
            >
              <Plus size={14} className="mr-1.5" />
              Start tracking
            </Button>
            <Button
              variant="ghost"
              onClick={handleClose}
              className="rounded-xl text-sm h-9 text-muted-foreground hover:text-foreground hover:bg-gray-100"
            >
              Cancel
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}