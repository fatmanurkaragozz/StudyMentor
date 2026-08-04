import type { EducationLevel } from "@prisma/client";

const GRADE_RANGES: Record<Exclude<EducationLevel, "LIFELONG_LEARNER">, [number, number]> = {
  MIDDLE_SCHOOL: [5, 8],
  HIGH_SCHOOL: [9, 12],
  UNIVERSITY: [1, 4],
};

// LIFELONG_LEARNER'da sinif kavrami yok - grade her zaman null/undefined olmali.
// Diger seviyelerde grade, o seviyenin gecerli araligi icinde olmali.
export function isValidGrade(educationLevel: EducationLevel, grade: number | null | undefined): boolean {
  if (educationLevel === "LIFELONG_LEARNER") {
    return grade === null || grade === undefined;
  }
  if (grade === null || grade === undefined) {
    return false;
  }
  const [min, max] = GRADE_RANGES[educationLevel];
  return Number.isInteger(grade) && grade >= min && grade <= max;
}
