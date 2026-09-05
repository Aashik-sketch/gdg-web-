"use client";

import React from "react";

/**
 * Checkbox used for react-table row selection.
 *
 * react-table passes an `indeterminate` prop; the previous implementation wrote
 * it to a non-standard `intermediate` DOM property, so the header checkbox never
 * reflected a partial selection. It now sets the real `indeterminate` property.
 */
export const CheckBoxComp = React.forwardRef(
  ({ indeterminate, "aria-label": ariaLabel, ...rest }, ref) => {
    const defaultRef = React.useRef(null);
    const resolveRef = ref || defaultRef;

    React.useEffect(() => {
      if (resolveRef && resolveRef.current) {
        resolveRef.current.indeterminate = Boolean(indeterminate);
      }
    }, [resolveRef, indeterminate]);

    return (
      <input
        type="checkbox"
        ref={resolveRef}
        aria-label={ariaLabel || "Select row"}
        className="h-4 w-4 cursor-pointer rounded border-input accent-primary"
        {...rest}
      />
    );
  }
);

CheckBoxComp.displayName = "CheckBoxComp";
