"use client";

import React from "react";

/**
 * Presentational hero for a department page.
 *
 * This component intentionally owns NO loading state. A previous version called
 * an `setIsLoading` prop inside an effect, which threw a TypeError whenever a
 * parent (e.g. the /development page) rendered it without that callback.
 *
 * The Photography -> Video Editing toggle is optional: if `setPhotoQs` is not
 * supplied the switch simply is not rendered, so callers that do not manage
 * that state never have to pass a no-op.
 */
const DeptHero = ({ dept, setPhotoQs, photoQs = false }) => {
  const name = dept?.name ?? "Departments";
  const canToggle = typeof setPhotoQs === "function";
  const showPhotoToggle = canToggle && name === "Photography";

  return (
    <section className="mx-auto w-full max-w-4xl px-4 py-10 text-center sm:py-14">
      <h1 className="font-display text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
        {!photoQs ? name : "Video Editing"}
      </h1>

      {dept?.body && (
        <p className="mx-auto mt-3 max-w-2xl text-balance text-muted-foreground">
          {dept.body}
        </p>
      )}

      {showPhotoToggle && (
        <div className="mt-4 flex items-center justify-center gap-2">
          <label className="inline-flex cursor-pointer items-center gap-2 text-sm text-muted-foreground">
            <input
              type="checkbox"
              className="h-4 w-4 rounded border-input accent-primary"
              checked={photoQs}
              onChange={() => setPhotoQs(!photoQs)}
            />
            Switch to Video Editing?
          </label>
        </div>
      )}

      <hr className="mx-auto mt-8 max-w-xl border-border" />
    </section>
  );
};

export default DeptHero;
