"use client";

import React from "react";
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
          {PopupData?.header && <DialogTitle>{PopupData.header}</DialogTitle>}
          {PopupData?.description && (
            <DialogDescription>{PopupData.description}</DialogDescription>
          )}
        </DialogHeader>

        {Array.isArray(PopupData?.message) && PopupData.message.length > 0 && (
          <ul className="list-disc space-y-2 pl-5 text-sm text-muted-foreground">
            {PopupData.message.map((message, index) => (
              <li key={index}>{message}</li>
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
