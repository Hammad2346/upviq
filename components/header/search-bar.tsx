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
import { Separator } from "../ui/separator";

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
        className="relative flex-1 max-w-md cursor-pointer group"
      >
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none group-hover:text-primary transition-colors" />
        <input
          placeholder="Search... (Ctrl + K)"
          className="pl-10 pr-3 h-10 w-full bg-white border border-border rounded-lg text-sm text-foreground placeholder:text-muted-foreground hover:border-primary/30 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
          readOnly
        />
      </div>


      <CommandDialog open={open} onOpenChange={setOpen} className="sm:max-w-lg">
        <Command className="border-0 rounded-lg shadow-lg space-y-4">

          <CommandInput
            value={search}
            onValueChange={setSearch}
            placeholder="Search profiles, keywords, insights..."
            className=" h-12 text-sm font-medium placeholder:text-muted-foreground"
          />
          <Separator className="bg-black"/>

          <CommandList className="max-h-80 ">
            <CommandEmpty className="py-8 text-center">
              <div className="flex flex-col items-center gap-2">
                <Search className="h-5 w-5 text-muted-foreground/40" />
                <p className="text-sm text-muted-foreground">No results found.</p>
              </div>
            </CommandEmpty>
          </CommandList>
        </Command>
      </CommandDialog>
    </>
  );
}