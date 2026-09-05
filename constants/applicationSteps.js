/**
 * The three steps of the applicant journey, shared by the departments page
 * (step 0), the join/application page (step 1) and the post-submission state
 * (step 2).
 *
 * Defined once here so the two pages cannot drift out of sync. Frozen so a
 * consumer cannot mutate the shared array.
 */
export const APPLICATION_STEPS = Object.freeze([
  Object.freeze({ label: "Select departments", description: "Pick up to two" }),
  Object.freeze({
    label: "Complete application",
    description: "Answer questions",
  }),
  Object.freeze({ label: "Submitted", description: "You're done" }),
]);

/** Zero-based index of each step, for readability at the call sites. */
export const STEP_SELECT = 0;
export const STEP_APPLY = 1;
export const STEP_SUBMITTED = 2;
