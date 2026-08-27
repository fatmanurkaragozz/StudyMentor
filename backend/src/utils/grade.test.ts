import { describe, it, expect } from "vitest";
import { isValidGrade } from "./grade.js";

describe("isValidGrade", () => {
  it("LIFELONG_LEARNER icin sinif olmamasini zorunlu kilar", () => {
    expect(isValidGrade("LIFELONG_LEARNER", null)).toBe(true);
    expect(isValidGrade("LIFELONG_LEARNER", undefined)).toBe(true);
    expect(isValidGrade("LIFELONG_LEARNER", 5)).toBe(false);
  });

  it("EXAM_PREP icin sinif olmamasini zorunlu kilar", () => {
    expect(isValidGrade("EXAM_PREP", null)).toBe(true);
    expect(isValidGrade("EXAM_PREP", 3)).toBe(false);
  });

  it("MIDDLE_SCHOOL icin 5-8 araligini kabul eder", () => {
    expect(isValidGrade("MIDDLE_SCHOOL", 5)).toBe(true);
    expect(isValidGrade("MIDDLE_SCHOOL", 8)).toBe(true);
    expect(isValidGrade("MIDDLE_SCHOOL", 4)).toBe(false);
    expect(isValidGrade("MIDDLE_SCHOOL", 9)).toBe(false);
  });

  it("MIDDLE_SCHOOL icin grade eksikse false doner", () => {
    expect(isValidGrade("MIDDLE_SCHOOL", null)).toBe(false);
    expect(isValidGrade("MIDDLE_SCHOOL", undefined)).toBe(false);
  });

  it("HIGH_SCHOOL icin 9-12 araligini kabul eder", () => {
    expect(isValidGrade("HIGH_SCHOOL", 9)).toBe(true);
    expect(isValidGrade("HIGH_SCHOOL", 12)).toBe(true);
    expect(isValidGrade("HIGH_SCHOOL", 8)).toBe(false);
    expect(isValidGrade("HIGH_SCHOOL", 13)).toBe(false);
  });

  it("UNIVERSITY icin 1-4 araligini kabul eder", () => {
    expect(isValidGrade("UNIVERSITY", 1)).toBe(true);
    expect(isValidGrade("UNIVERSITY", 4)).toBe(true);
    expect(isValidGrade("UNIVERSITY", 0)).toBe(false);
    expect(isValidGrade("UNIVERSITY", 5)).toBe(false);
  });
});
