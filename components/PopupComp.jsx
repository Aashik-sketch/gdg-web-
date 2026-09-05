"use client";

import React from "react";
import { Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

/**
 * A notice dialog built on the accessible Radix-backed shadcn Dialog:
 * focus trap, Escape-to-close and aria wiring come from the primitive.
 *
 * Closing (overlay click, Escape, the X button, or "Got it") is funnelled
 * through onOpenChange so a single onClose handler covers every path.
 */
const PopupComp = ({ isOpen, onClose, PopupData }) => {
  const handleOpenChange = (open) => {
    if (!open) onClose?.();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          {PopupData?.header && (
            <DialogTitle className="flex items-center gap-2">
              <span
                aria-hidden="true"
                className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-info/10 text-info"
              >
                <Info className="h-4 w-4" />
              </span>
              {PopupData.header}
            </DialogTitle>
          )}
          {PopupData?.description && (
            <DialogDescription>{PopupData.description}</DialogDescription>
          )}
        </DialogHeader>

        {Array.isArray(PopupData?.message) && PopupData.message.length > 0 && (
          <ul className="space-y-2 text-sm text-muted-foreground">
            {PopupData.message.map((message, index) => (
              <li key={index} className="flex gap-2">
                <span
                  aria-hidden="true"
                  className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-info"
                />
                <span>{message}</span>
              </li>
            ))}
          </ul>
        )}

        <DialogFooter>
          <Button type="button" onClick={onClose}>
            Got it
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default PopupComp;
