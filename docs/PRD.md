# skilldeck

Status: in-progress

## Scorecard

Total: 88/100
Band: build now
Last scored: 2026-04-29
Scored by: Neo

| Criterion | Points | Notes |
|---|---:|---|
| Problem pain | 18/20 | Directly addresses a repeated workflow pain. |
| Demand signal | 18/20 | Strong source signal or internal demand. |
| V1 buildability | 18/20 | Small deterministic V1 is feasible. |
| Differentiation | 14/15 | Clear wedge versus adjacent tools. |
| Agentic workflow leverage | 15/15 | Improves agent throughput or supervision. |
| Distribution potential | 5/10 | Distribution will require examples and content. |

## Pitch

A portable skill registry, installer, and verifier for agent instructions across Codex, Claude Code, OpenClaw, and repo-local AGENTS files.

## Why It Matters

Skills are becoming the unit of reusable agent behavior. Roger already uses OpenClaw skills and wants agent teams. Owning the skill packaging layer is strategically valuable.

## Qualification

Matt Pocock’s skills repo is explicit evidence of developer interest in small composable agent skills. OpenClaw also uses skills locally, giving strong internal demand.

Source / adjacent research: Inspired by mattpocock/skills, a public skills repo for real engineering agents; README claims a 60k developer newsletter audience.

Decision: build now

## V1 Scope

- Validate skill folder structure and SKILL.md metadata
- Install selected skills into supported agent targets
- Generate compatibility report
- Create skill packs from existing repo docs

## Out of Scope

- Marketplace hosting
- Remote execution
- Paid distribution

## Verification

- Unit or fixture tests for core parsing/generation behavior.
- README with install, quickstart, and safety notes.
- Local-first behavior documented clearly.
- No hidden network, credential, or publish behavior.

## Agent Prompt

Build `skilldeck` as a local-first skill pack manager with adapters for common agent directories and a strict validation mode.
