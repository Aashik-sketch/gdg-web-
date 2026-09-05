import { describe, expect, it, vi } from "vitest";
import {
  DEPARTMENT_ID_LIST,
  DEPARTMENT_NAME_BY_ID,
  departments,
  getDepartmentById,
  getQuestionsForDepartmentId,
  isKnownDepartmentId,
} from "@/constants/departments";
import { reviews, QuestionnaireData } from "@/constants";

describe("department catalogue", () => {
  it("exposes every catalogue entry", () => {
    expect(departments).toHaveLength(reviews.length);
    expect(DEPARTMENT_ID_LIST).toHaveLength(reviews.length);
  });

  it("has unique ids", () => {
    expect(new Set(DEPARTMENT_ID_LIST).size).toBe(DEPARTMENT_ID_LIST.length);
  });

  it("attaches a questionnaire to every department", () => {
    // Every department must have questions, otherwise its application form
    // renders with no department-specific fields.
    for (const department of departments) {
      expect(
        department.questions.length,
        `${department.id} has no questions`,
      ).toBeGreaterThan(0);
    }
  });

  it("resolves questions by id, matching the name-keyed source data", () => {
    for (const department of departments) {
      const original = reviews.find((r) => r.id === department.id);
      const expected =
        QuestionnaireData.find((q) => q.department === original.name)?.questions ??
        [];
      expect(getQuestionsForDepartmentId(department.id)).toHaveLength(
        expected.length,
      );
    }
  });

  it("normalises every question into an object with a name", () => {
    for (const department of departments) {
      for (const question of department.questions) {
        expect(typeof question).toBe("object");
        expect(typeof question.name).toBe("string");
        expect(question.name.length).toBeGreaterThan(0);
      }
    }
  });

  it("looks a department up by id and rejects unknown ids", () => {
    expect(getDepartmentById(DEPARTMENT_ID_LIST[0])).not.toBeNull();
    expect(getDepartmentById("nope")).toBeNull();
    expect(isKnownDepartmentId(DEPARTMENT_ID_LIST[0])).toBe(true);
    expect(isKnownDepartmentId("nope")).toBe(false);
  });

  it("maps ids to display names", () => {
    for (const department of departments) {
      expect(DEPARTMENT_NAME_BY_ID[department.id]).toBe(department.name);
    }
  });

  it("freezes entries so a consumer cannot mutate the shared catalogue", () => {
    expect(Object.isFrozen(departments[0])).toBe(true);
  });
});

describe("renaming a department", () => {
  it("changes the display name without detaching its questionnaire", async () => {
    const target = reviews[0];
    const renamed = "Web Development";

    vi.resetModules();
    vi.doMock("@/constants/departmentNames", () => ({
      DEPARTMENT_NAMES: { [target.id]: renamed },
      DEPARTMENT_DESCRIPTIONS: {},
    }));

    const fresh = await import("@/constants/departments");
    const department = fresh.getDepartmentById(target.id);

    expect(department.name).toBe(renamed);
    // This is the whole point: questions survive the rename, because they are
    // resolved by id rather than by the display name.
    const expected =
      QuestionnaireData.find((q) => q.department === target.name)?.questions ?? [];
    expect(department.questions).toHaveLength(expected.length);
    expect(department.questions.length).toBeGreaterThan(0);

    vi.doUnmock("@/constants/departmentNames");
    vi.resetModules();
  });

  it("ignores a blank override and keeps the catalogue name", async () => {
    const target = reviews[1];

    vi.resetModules();
    vi.doMock("@/constants/departmentNames", () => ({
      DEPARTMENT_NAMES: { [target.id]: "   " },
      DEPARTMENT_DESCRIPTIONS: {},
    }));

    const fresh = await import("@/constants/departments");
    expect(fresh.getDepartmentById(target.id).name).toBe(target.name);

    vi.doUnmock("@/constants/departmentNames");
    vi.resetModules();
  });
});
