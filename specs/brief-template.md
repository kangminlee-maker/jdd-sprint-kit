---
# ── Brownfield Source Declaration ────────────────────────
# Project-wide defaults. /sprint copies this frontmatter when creating brief.md.
# Write your feature description in the body section below ---.
#
# role: backend | client | ontology | design-system
# url: GitHub repo (tarball download)
# path: local directory (--add-dir alternative)

sources:
  - url: "https://github.com/re-speak/podo-backend"
    role: backend
    notes: "Java/Spring Boot. Lesson/ticket domain"
  - url: "https://github.com/re-speak/podo-app"
    role: client
    notes: "Vue/Nuxt mobile app"
  - url: "https://github.com/re-speak/podo-ontology"
    role: ontology
    notes: "Domain SSOT. glossary 5 domains, 55 classes, 134 relationships, 43 enums, 7 state machines, 155 actions, naming audit, generated/ cross-references"
  - path: "specs/podo-design-guide.md"
    role: design-system
    notes: "3-tier tokens (Static/Semantic/Scale), Tailwind mapping, 20+ CVA components, 8 layout templates, 142 screens flow map, credit system extension (3-color assets, 13 new screens), Korean copy style guide"

policy_docs:
  - "specs/terms-of-service.md"

# Optional references (project-specific, not universal)
# figma:
#   - file_key: "abc123"
#     description: "Wireframes"
# scan_notes: ""
---

# {feature_name}

## Background
(Why this feature is needed)

## Feature Description
(Describe the specific feature to build)
