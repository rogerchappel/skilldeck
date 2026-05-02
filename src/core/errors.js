export class SkilldeckError extends Error {
  constructor(message, { code = 'SKILLDECK_ERROR', details = undefined } = {}) {
    super(message);
    this.name = 'SkilldeckError';
    this.code = code;
    this.details = details;
  }
}

export function fail(message, options) {
  throw new SkilldeckError(message, options);
}
