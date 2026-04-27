import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "../ui/dialog";
import { Label } from "../ui/label";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { Plus } from "lucide-react";

export default function AddKeywordDialog({
  open,
  onClose,
  onAdd,
}: {
  open: boolean;
  onClose: () => void;
  onAdd: (name: string) => void;
}) {
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
      <DialogContent
        className="sm:max-w-md border-[hsl(224_30%_16%)] p-0 overflow-hidden"
        style={{ background: "hsl(224 39% 9%)" }}
      >

        <div
          className="absolute top-0 left-0 right-0 h-px pointer-events-none"
          style={{ background: "linear-gradient(90deg, transparent, hsl(190 95% 55% / 0.55), transparent)" }}
        />

        <div className="p-6 space-y-5">
          <DialogHeader className="space-y-1">
            <DialogTitle
              className="text-lg font-bold text-foreground"
              style={{ fontFamily: "'Space Grotesk', system-ui, sans-serif" }}
            >
              Track new keyword
            </DialogTitle>
            <DialogDescription className="text-sm text-[hsl(215_20%_55%)]">
              Enter a keyword to monitor its demand, competition, and your ranking position.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-2">
            <Label className="text-xs font-semibold tracking-widest uppercase text-[hsl(215_20%_65%)]">
              Keyword
            </Label>
            <Input
              autoFocus
              placeholder="e.g. react developer"
              value={value}
              onChange={(e) => setValue(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
              className="bg-[hsl(224_30%_12%)] border-[hsl(224_30%_18%)] text-foreground placeholder:text-[hsl(215_20%_38%)] focus-visible:ring-[hsl(190_95%_55%/0.4)] rounded-xl h-10"
              style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "0.8rem" }}
            />
            <p className="text-xs text-[hsl(215_20%_42%)]">
              Use descriptive phrases like "react developer" or "ui/ux designer" for better signal accuracy.
            </p>
          </div>

          <div className="flex items-center gap-3 pt-1">
            <Button
              onClick={handleSubmit}
              disabled={!ready}
              className="flex-1 rounded-xl font-semibold text-sm h-9 transition-all duration-200"
              style={{
                background: ready
                  ? "linear-gradient(135deg, hsl(190 95% 55%), hsl(195 100% 65%))"
                  : "hsl(224 30% 14%)",
                color: ready ? "hsl(224 47% 6%)" : "hsl(215 20% 40%)",
                boxShadow: ready ? "0 0 22px hsl(190 95% 55% / 0.28)" : "none",
              }}
            >
              <Plus size={14} className="mr-1.5" />
              Start tracking
            </Button>
            <Button
              variant="ghost"
              onClick={handleClose}
              className="rounded-xl text-sm h-9 text-[hsl(215_20%_55%)] hover:text-foreground hover:bg-[hsl(224_30%_14%)]"
            >
              Cancel
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}