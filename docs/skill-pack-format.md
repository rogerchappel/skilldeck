# Skill Pack Format

`skilldeck pack` writes a transparent JSON file with the `.skillpack` extension.

- `schema`: fixed schema URL for V1 packs.
- `manifest`: metadata, file list, sizes, and SHA-256 digests.
- `files`: relative paths with base64 encoded file contents.

The V1 format is intentionally boring and inspectable. It avoids hidden extraction behavior, remote fetches, executable post-install hooks, and implicit target discovery.
