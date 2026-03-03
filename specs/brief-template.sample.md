---
# ── Brownfield Source Declaration ────────────────────────
# Project-wide defaults. /sprint copies this frontmatter when creating brief.md.
# Write your feature description in the body section below ---.
#
# Copy this file to specs/brief-template.md and fill in your project's sources.
# specs/brief-template.md is gitignored (contains project-specific data).
#
# role: backend | client | ontology | design-system
# url: GitHub repo (tarball download)
# path: local directory (--add-dir alternative)

sources:
  - url: "https://github.com/acme/acme-api"
    role: backend
    notes: "Java/Spring Boot. Order/payment domain"
  - url: "https://github.com/acme/acme-web"
    role: client
    notes: "React SPA. Customer-facing storefront"
  - path: "/Users/you/repos/acme-ontology/"
    role: ontology
    notes: "Domain glossary, entity relationship docs"
  # - path: "/Users/you/repos/acme-design-system/"
  #   role: design-system
  #   notes: "Design tokens, component specs"

policy_docs:
  - "terms-of-service.md"
  - "refund-policy.md"

# Optional references (project-specific, not universal)
# figma:
#   - file_key: "abc123def"
#     description: "v2 wireframes"
# scan_notes: "Focus on checkout flow and inventory management"
---

# {feature_name}

## Background
(Why this feature is needed)

## Feature Description
(Describe the specific feature to build)
