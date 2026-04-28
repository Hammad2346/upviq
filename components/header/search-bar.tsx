"use client";

import * as React from "react";
import {
  Command,
  CommandDialog,
  CommandInput,
  CommandEmpty,
  CommandList,
} from "../ui/command";
import { Search } from "lucide-react";

export default function SearchCommand() {
  const [open, setOpen] = React.useState(false);
  const [search, setSearch] = React.useState("");

  React.useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen((prev) => !prev);
      }
    };

    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  return (
    <>
      <div
        onClick={() => setOpen(true)}
        className="relative flex-1 max-w-sm cursor-pointer"
      >
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground pointer-events-none" />
        <input
          placeholder="Search... (Ctrl + K)"
          className="pl-9 h-9 w-full bg-secondary border border-border rounded-md text-sm text-foreground placeholder:text-muted-foreground"
          readOnly
        />
      </div>

      <CommandDialog open={open} onOpenChange={setOpen} className="sm:max-w-lg ">
        <Command className="glow-border">
          <CommandInput
            value={search}
            onValueChange={setSearch}
            placeholder="Type to search..."
            className="h-11 text-sm"
          />

          <CommandList>
            <CommandEmpty>No results found.</CommandEmpty>
          </CommandList>
        </Command>
      </CommandDialog>
    </>
  );
}
