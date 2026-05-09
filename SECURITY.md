# Security Policy

`skilldeck` manages instruction files. Treat skill content as untrusted text.

## Supported versions

Security fixes target the latest released minor version.

## Reporting

Please report vulnerabilities through GitHub Security Advisories when available, or open a minimal issue that does not include exploitable private details.

## MVP security posture

- No remote fetching.
- No credential reads.
- No skill execution.
- File writes are limited to explicit install or pack destinations.
