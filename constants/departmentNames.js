/**
 * DEPARTMENT DISPLAY NAMES — this is the only file you need to edit to rename a
 * department.
 *
 * Why an override map instead of editing constants/index.js directly:
 * the department NAME used to be the join key that linked a department to its
 * questionnaire (constants/index.js `QuestionnaireData` matches on
 * `department` === name), to submission validation (lib/validation.js), and to
 * duplicate/cap detection. Renaming a department therefore used to silently
 * delete its questionnaire and reject its applications.
 *
 * The stable UUID is now the join key everywhere, and the name is display-only.
 * That makes renaming safe: fill in a value below and nothing else has to
 * change.
 *
 * Leave a value as "" to keep the name currently in constants/index.js.
 *
 * NOTE: the names in constants/index.js are scrambled placeholders, as are the
 * questionnaire questions. Both need real copy before this portal goes live.
 * Filling in this file fixes the names; the questions still need to be replaced
 * in constants/index.js.
 */
export const DEPARTMENT_NAMES = {
  "c21ca066-ab4d-40a3-943c-f170d6312bdc": "", // currently "§_Mn9X7_qz" — 5 questions
  "4499a966-2740-4c36-88dd-8916a909fc77": "", // currently "¥_Pb!8Q_wk" — 3 questions
  "3936d5a2-acd9-4a98-ac97-42c2c92f5c02": "", // currently "∆_Ot₹3W_vx" — 5 questions
  "e2ed9c2c-c36c-457f-a8bb-cf2e8bc7c2e1": "", // currently "ø_UxK2_mj" — 10 questions
  "d3beefc1-f8b0-4202-b26c-36e9804b6636": "", // currently "π_Ds9J8_tr" — 6 questions
  "8143de1d-db17-42fa-958d-13b10804f894": "", // currently "µ_Wb₹5D_lp" — 8 questions
  "339f0f8a-72f2-44b9-92ab-2b0d4dcfa0f6": "", // currently "∑_ApZ3V_gh" — 5 questions
  "9055864f-c7dc-44cd-91d5-8759d32a496a": "", // currently "Ω_GmF6X_ny" — 7 questions
  "c0f3b1d1-ce05-45f6-9e34-ac9443fc5fcb": "", // currently "≈_DtB1S_zk" — 7 questions
  "a1d920df-9eb9-49eb-b3a4-e4a3d1245ede": "", // currently "∂_CdH4D_bv" — 4 questions
  "6a89c4e2-7b19-4f32-821e-9821a41b5201": "", // currently "∫_BkY2C_xu" — 4 questions
  "3e9ac635-01d4-495e-aa87-a7335a2403c2": "", // currently "≤_CpM8P_rw" — 6 questions
};

/**
 * Optional description overrides, same rules as above. Leave "" to keep the
 * description from constants/index.js.
 */
export const DEPARTMENT_DESCRIPTIONS = {};
