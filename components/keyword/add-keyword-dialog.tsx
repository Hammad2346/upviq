"use client";

import { useState, useEffect, useRef } from "react";
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
import { Plus, Loader2 } from "lucide-react";
import axios from "axios";

interface SkillSuggestion {
  id: string;
  label: string;
  value: string;
}

interface AddKeywordDialogProps {
  open: boolean;
  onClose: () => void;
  onAdd: (keyword: string, upworkSkillName: string) => Promise<void>;
}

export default function AddKeywordDialog({ open, onClose, onAdd }: AddKeywordDialogProps) {
  const [value, setValue]             = useState("");
  const [suggestions, setSuggestions] = useState<SkillSuggestion[]>([]);
  const [selected, setSelected]       = useState<SkillSuggestion | null>(null);
  const [searching, setSearching]     = useState(false);
  const [submitting, setSubmitting]   = useState(false);
  const [error, setError]             = useState("");
  const debounceRef                   = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (selected) return;
    if (value.trim().length < 2) {
      setSuggestions([]);
      return;
    }

    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      setSearching(true);
      try {
        const { data } = await axios.get(`/api/market/keywords/search?q=${encodeURIComponent(value.trim())}`);
        console.log(data)
        setSuggestions(data.results ?? []);
      } catch {
        setSuggestions([]);
      } finally {
        setSearching(false);
      }
    }, 350);
  }, [value, selected]);

  function handleSelect(s: SkillSuggestion) {
    setSelected(s);
    setValue(s.label);
    setSuggestions([]);
    setError("");
  }

  async function handleSubmit() {
    if (submitting) return;
    setError("");

    const skillName = selected?.value ?? value.trim();
    if (!skillName) return;

    setSubmitting(true);
    try {
      await onAdd(value.trim(), skillName);
      handleClose();
    } catch (err: any) {
      setError(err?.response?.data?.error ?? "Failed to add keyword");
    } finally {
      setSubmitting(false);
    }
  }

  function handleClose() {
    setValue("");
    setSuggestions([]);
    setSelected(null);
    setError("");
    setSubmitting(false);
    onClose();
  }

  function handleInputChange(val: string) {
    setValue(val);
    if (selected) setSelected(null);
    setError("");
  }

  const ready = value.trim().length > 0;

  return (
    <Dialog open={open} onOpenChange={(o) => { if (!o) handleClose(); }}>

      <DialogContent className="sm:max-w-md border-border p-0 bg-white">

        <div
          className="absolute top-0 left-0 right-0 h-px pointer-events-none rounded-t-lg"
          style={{ background: "var(--gradient-border)" }}
        />

        <div className="p-6 space-y-5">

          <DialogHeader className="space-y-1">
            <DialogTitle
              className="text-lg font-bold text-foreground"
              style={{ fontFamily: "Arial, sans-serif" }}
            >
              Track new keyword
            </DialogTitle>
            <DialogDescription className="text-sm text-muted-foreground">
              Search for a skill to monitor its demand, competition, and opportunity score.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-2">
            <Label className="text-xs font-semibold tracking-widest uppercase text-muted-foreground">
              Keyword
            </Label>

            <div className="relative">
              <Input
                autoFocus
                placeholder="e.g. React, Next.js, Python..."
                value={value}
                onChange={(e) => handleInputChange(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
                className="bg-gray-50 border-border text-foreground placeholder:text-muted-foreground focus-visible:ring-primary/20 rounded-xl h-10"
                style={{ fontFamily: "JetBrains Mono, monospace", fontSize: "0.8rem" }}
              />

              {searching && (
                <Loader2
                  size={14}
                  className="absolute right-3 top-1/2 -translate-y-1/2 animate-spin text-muted-foreground"
                />
              )}

              {suggestions.length > 0 && (
                <div className="absolute z-[9999] top-full mt-1 w-full bg-white border border-border rounded-xl shadow-xl overflow-hidden">
                  {suggestions.map((s) => (
                    <button
                      key={s.id}
                      onMouseDown={(e) => {
                        e.preventDefault();
                        handleSelect(s);
                      }}
                      className="w-full text-left px-4 py-2.5 text-sm hover:bg-gray-50 transition-colors border-b border-border last:border-0"
                      style={{ fontFamily: "JetBrains Mono, monospace", fontSize: "0.78rem" }}
                    >
                      {s.label}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {selected ? (
              <p className="text-xs text-primary font-medium">
                ✓ Matched to Upwork skill: {selected.value}
              </p>
            ) : (
              <p className="text-xs text-muted-foreground">
                Type to search Upwork skills. Select a suggestion for best accuracy.
              </p>
            )}

            {error && (
              <p className="text-xs text-destructive font-medium">{error}</p>
            )}
          </div>

          <div className="flex items-center gap-3 pt-1">
            <Button
              onClick={handleSubmit}
              disabled={!ready || submitting}
              className="flex-1 rounded-xl font-semibold text-sm h-9 transition-all duration-200 bg-primary text-primary-foreground hover:bg-primary/90 disabled:bg-gray-200 disabled:text-muted-foreground"
            >
              {submitting ? (
                <Loader2 size={14} className="mr-1.5 animate-spin" />
              ) : (
                <Plus size={14} className="mr-1.5" />
              )}
              {submitting ? "Adding..." : "Start tracking"}
            </Button>
            <Button
              variant="ghost"
              onClick={handleClose}
              disabled={submitting}
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