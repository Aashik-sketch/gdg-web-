"use client";

import * as React from "react";
import { Check, ChevronsUpDown } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
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
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={open}
                    aria-label={
                        selectedLabel
                            ? `Filter by shortlisted: ${selectedLabel}`
                            : "Filter by shortlisted status"
                    }
                    className="w-[200px] justify-between"
                >
                    {selectedLabel ? (
                        <span className="truncate">Shortlisted: {selectedLabel}</span>
                    ) : (
                        <span className="flex items-center gap-2">
                            <IoFilter aria-hidden="true" />
                            Shortlisted
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
    );
}
