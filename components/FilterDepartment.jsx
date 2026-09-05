"use client";

import * as React from "react";
import { Check, ChevronsUpDown, X } from "lucide-react";

import { reviews } from "@/constants";

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

const departments = [
    ...reviews.map((r) => ({ value: r.name, label: r.name })),
    { value: "Video Editing", label: "Video Editing" },
];

export default function FilterDepartment({ filterFunc, value }) {
    const [open, setOpen] = React.useState(false);
    const selected = value ?? null;

    const handleSelect = (nextValue) => {
        const next = nextValue === selected ? null : nextValue;
        setOpen(false);
        filterFunc(next);
    };

    return (
        <div className="flex flex-col gap-1">
            <Label htmlFor="filter-department">Department</Label>
            <div className="flex items-center gap-1">
                <Popover open={open} onOpenChange={setOpen}>
                    <PopoverTrigger asChild>
                        <Button
                            id="filter-department"
                            variant="outline"
                            role="combobox"
                            aria-expanded={open}
                            aria-label={
                                selected
                                    ? `Filter by department: ${selected}`
                                    : "Filter by department"
                            }
                            className="w-[200px] justify-between font-normal"
                        >
                            {selected ? (
                                <span className="truncate">{selected}</span>
                            ) : (
                                <span className="flex items-center gap-2 text-muted-foreground">
                                    <IoFilter aria-hidden="true" />
                                    All departments
                                </span>
                            )}
                            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-fit p-0">
                        <Command>
                            <CommandInput placeholder="Search department..." />
                            <CommandList>
                                <CommandEmpty>No department found.</CommandEmpty>
                                <CommandGroup>
                                    {departments.map((dept) => (
                                        <CommandItem
                                            key={dept.value}
                                            value={dept.value}
                                            onSelect={() => handleSelect(dept.value)}
                                        >
                                            <Check
                                                className={cn(
                                                    "mr-2 h-4 w-4",
                                                    selected === dept.value
                                                        ? "opacity-100"
                                                        : "opacity-0"
                                                )}
                                            />
                                            {dept.label}
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
                        aria-label="Clear department filter"
                        onClick={() => filterFunc(null)}
                    >
                        <X className="h-4 w-4" aria-hidden="true" />
                    </Button>
                )}
            </div>
        </div>
    );
}
