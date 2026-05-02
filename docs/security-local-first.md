# Local-First Security Notes

`skilldeck` is deliberately a file operation tool.

- Runtime commands do not call HTTP APIs.
- Installs require an explicit `--target-dir`.
- Existing files are preserved unless `--force` is provided.
- Pack extraction writes only relative paths contained in the pack.
- Strict validation flags sensitive-looking filenames before packaging.

Review `.skillpack` JSON before installing packs from other people.
