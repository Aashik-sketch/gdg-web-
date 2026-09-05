import { reviews, QuestionnaireData } from "./index";
import { DEPARTMENT_NAMES, DEPARTMENT_DESCRIPTIONS } from "./departmentNames";

/**
 * Canonical department catalogue, keyed by stable UUID.
 *
 * Before this module existed, the department NAME was the join key in four
 * places: the questionnaire lookup, submission validation, duplicate/cap
 * detection, and the localStorage draft key. Renaming a department therefore
 * silently detached its questions and made its applications invalid.
 *
 * Here the id is the join key and the name is display-only, overridable from
 * constants/departmentNames.js. Questions are resolved once, using the ORIGINAL
 * catalogue name (which is what constants/index.js keys on internally), and
 * then attached to the id.
 */

const normalise = (value) =>
  String(value ?? "")
    .trim()
    .toLowerCase()
    .replace(/\s*\/\s*/g, "/");

/** Questions keyed by the original (pre-override) department name. */
const questionsByOriginalName = new Map(
  QuestionnaireData.map((entry) => [normalise(entry.department), entry.questions ?? []]),
);

/** Normalise a questionnaire entry into a consistent shape. */
export const normaliseQuestion = (question) =>
  typeof question === "string"
    ? { name: question, type: "generic", placeholder: "2-3 sentences" }
    : question;

export const departments = reviews.map((department) => {
  const override = DEPARTMENT_NAMES[department.id];
  const descriptionOverride = DEPARTMENT_DESCRIPTIONS[department.id];

  return Object.freeze({
    id: department.id,
    /** Display name. Falls back to the catalogue value when no override is set. */
    name: override?.trim() ? override.trim() : department.name,
    description: descriptionOverride?.trim()
      ? descriptionOverride.trim()
      : department.description,
    icon: department.icon,
    tone: department.tone,
    questions: (questionsByOriginalName.get(normalise(department.name)) ?? []).map(
      normaliseQuestion,
    ),
  });
});

const byId = new Map(departments.map((department) => [department.id, department]));

/** @returns {(typeof departments)[number] | null} */
export const getDepartmentById = (id) => byId.get(id) ?? null;

/** @returns {boolean} */
export const isKnownDepartmentId = (id) => byId.has(id);

/** @returns {Array} the questionnaire for a department id, or []. */
export const getQuestionsForDepartmentId = (id) =>
  byId.get(id)?.questions ?? [];

/** Display names, in catalogue order. */
export const DEPARTMENT_NAME_LIST = departments.map((d) => d.name);

/** Every valid department id. */
export const DEPARTMENT_ID_LIST = departments.map((d) => d.id);

/** id -> display name, for rendering stored submissions. */
export const DEPARTMENT_NAME_BY_ID = Object.fromEntries(
  departments.map((d) => [d.id, d.name]),
);
