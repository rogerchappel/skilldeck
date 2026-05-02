const TARGETS = {
  openclaw: {
    label: 'OpenClaw skill',
    installSubdir: 'skills/<name>',
    supportsFolders: true,
    requires: ['SKILL.md'],
    notes: ['Best fit: native folder skill with SKILL.md.']
  },
  claude: {
    label: 'Claude Code skill',
    installSubdir: 'skills/<name>',
    supportsFolders: true,
    requires: ['SKILL.md'],
    notes: ['Compatible as a local skill folder; review frontmatter conventions for your Claude setup.']
  },
  codex: {
    label: 'Codex / AGENTS.md style',
    installSubdir: '<repo>/.skilldeck/<name>',
    supportsFolders: true,
    requires: ['SKILL.md'],
    notes: ['Codex does not have one universal skill registry; install explicitly and reference from AGENTS.md.']
  },
  'agents-md': {
    label: 'Repo-local AGENTS.md',
    installSubdir: '<repo>/.skilldeck/<name>',
    supportsFolders: true,
    requires: ['SKILL.md'],
    notes: ['Use skilldeck compat output to paste references into AGENTS.md.']
  }
};

export function compatibilityReport(validation, { target = undefined } = {}) {
  const selected = target ? { [target]: TARGETS[target] } : TARGETS;
  const targets = Object.entries(selected).map(([key, spec]) => {
    if (!spec) {
      return { target: key, ok: false, score: 0, issues: [`Unknown target: ${key}`], notes: [] };
    }
    const missing = spec.requires.filter((file) => !validation.files.includes(file));
    const issues = [...validation.issues.filter((issue) => issue.level === 'error').map((issue) => issue.message), ...missing.map((file) => `Missing ${file}`)];
    const declared = validation.metadata?.targets ?? [];
    const declarationBonus = declared.length === 0 || declared.includes(key) || (key === 'claude' && declared.includes('claude-code')) ? 10 : 0;
    return {
      target: key,
      label: spec.label,
      ok: issues.length === 0,
      score: Math.max(0, 90 + declarationBonus - issues.length * 35 - validation.issues.filter((issue) => issue.level === 'warning').length * 5),
      installSubdir: spec.installSubdir.replace('<name>', validation.metadata?.name ?? 'skill'),
      issues,
      notes: spec.notes
    };
  });
  return { ok: targets.every((item) => item.ok), targets };
}

export function supportedTargets() {
  return Object.keys(TARGETS);
}
