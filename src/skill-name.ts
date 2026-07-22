export const SKILL_NAME_PATTERN = /^[a-z0-9][a-z0-9-]{1,62}$/;
export const SKILL_NAME_CONSTRAINT = "2-63 lowercase letters, numbers, or hyphens, starting with a letter or number";

export function isValidSkillName(name: string): boolean {
  return SKILL_NAME_PATTERN.test(name);
}
