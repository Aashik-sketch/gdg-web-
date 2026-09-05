"use client";

import * as React from "react";
import { Check, ChevronsUpDown, X } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { IoFilter } from "react-icons/io5";
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from "@/components/ui/command";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";

const options = [
    { value: "true", label: "Yes" },
    { value: "false", label: "No" },
];

export default function FilterShortlisted({ filterFunc, value }) {
    const [open, setOpen] = React.useState(false);
    const selected = value ?? null;
    const selectedLabel = options.find((o) => o.value === selected)?.label;

    const handleSelect = (nextValue) => {
        const next = nextValue === selected ? null : nextValue;
        setOpen(false);
        filterFunc(next);
    };

    return (
        <div className="flex flex-col gap-1">
            <Label htmlFor="filter-shortlisted">Shortlisted</Label>
            <div className="flex items-center gap-1">
                <Popover open={open} onOpenChange={setOpen}>
                    <PopoverTrigger asChild>
                        <Button
                            id="filter-shortlisted"
                            variant="outline"
                            role="combobox"
                            aria-expanded={open}
                            aria-label={
                                selectedLabel
                                    ? `Filter by shortlisted: ${selectedLabel}`
                                    : "Filter by shortlisted status"
                            }
                            className="w-[200px] justify-between font-normal"
                        >
                            {selectedLabel ? (
                                <span className="truncate">{selectedLabel}</span>
                            ) : (
                                <span className="flex items-center gap-2 text-muted-foreground">
                                    <IoFilter aria-hidden="true" />
                                    Any status
                                </span>
                            )}
                            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-fit p-0">
                        <Command>
                            <CommandInput placeholder="Search shortlisted..." />
                            <CommandList>
                                <CommandEmpty>No value found.</CommandEmpty>
                                <CommandGroup>
                                    {options.map((option) => (
                                        <CommandItem
                                            key={option.value}
                                            value={option.value}
                                            onSelect={() => handleSelect(option.value)}
                                        >
                                            <Check
                                                className={cn(
                                                    "mr-2 h-4 w-4",
                                                    selected === option.value
                                                        ? "opacity-100"
                                                        : "opacity-0"
                                                )}
                                            />
                                            {option.label}
                                        </CommandItem>
                                    ))}
                                </CommandGroup>
                            </CommandList>
                        </Command>
                    </PopoverContent>
                </Popover>
                {selected && (
                    <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="h-10 w-9 shrink-0 text-muted-foreground hover:text-foreground"
                        aria-label="Clear shortlisted filter"
                        onClick={() => filterFunc(null)}
                    >
                        <X className="h-4 w-4" aria-hidden="true" />
                    </Button>
                )}
            </div>
        </div>
    );
}
