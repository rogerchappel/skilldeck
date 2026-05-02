export const targetPresets = {
  openclaw: {
    installHint: '~/.openclaw/workspace/agents/<agent>/skills',
    reference: '<available_skills> registry entry points at SKILL.md'
  },
  claude: {
    installHint: '~/.claude/skills or repo-local skills folder',
    reference: 'Reference the copied skill from project instructions.'
  },
  codex: {
    installHint: '<repo>/.skilldeck',
    reference: 'Add a short pointer in AGENTS.md or equivalent repo instruction file.'
  },
  'agents-md': {
    installHint: '<repo>/.skilldeck',
    reference: 'Paste skill summaries into AGENTS.md and keep files local.'
  }
};

export function getTargetPreset(target) {
  return targetPresets[target];
}
