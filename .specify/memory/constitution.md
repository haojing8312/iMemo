<!--
SYNC IMPACT REPORT
==================
Version Change: 0.0.0 → 1.0.1
Rationale: Initial constitution ratification for HomeMemo project with immediate patch for AI model clarification

Modified Principles:
  - Principle II: "AI-Local, AI-Transparent" → "AI-Transparent with Privacy Protection"
    (Changed from local-only to cloud AI with privacy safeguards, future local model support)
Added Sections:
  - Core Principles (5 principles)
  - Privacy & Security Standards
  - Quality & Performance Standards
  - Governance

Templates Requiring Updates:
  ✅ .specify/templates/plan-template.md - Constitution Check section aligned
  ✅ .specify/templates/spec-template.md - Requirements structure aligned
  ✅ .specify/templates/tasks-template.md - Task organization aligned

Follow-up TODOs: None
-->

# HomeMemo Constitution

## Core Principles

### I. Privacy-First Architecture

**MUST** store all user data, photos, and AI-generated content exclusively on local storage. **MUST NOT** transmit personal photos, family data, or generated images to external servers. Network access is **ONLY** permitted for:
- Application updates and security patches
- AI model downloads (stored locally after download)
- Optional anonymous usage analytics (opt-in only, no personal data)

**Rationale**: Family photos and baby pictures are highly sensitive. Parents must have complete control and confidence that their children's images never leave their device. This is non-negotiable for trust and regulatory compliance (especially child privacy laws).

### II. AI-Transparent with Privacy Protection

**MUST** clearly communicate to users which AI service is being used (e.g., nano banana cloud API). **MUST** provide visibility into:
- Which AI model/service is active
- Approximate generation time before starting
- Progress indicators during generation
- Data transmission scope (only uploaded: photo + style parameters; never stored on cloud)

**MUST** implement privacy safeguards for cloud AI services:
- Photos transmitted only during generation request
- Immediate deletion from cloud service after generation
- No cloud storage or logging of personal photos
- Clear user consent before first cloud API call

**MAY** support local AI models as optional alternative. When local models available, **MUST** allow user choice between cloud (faster) and local (more private).

**Rationale**: Cloud AI services like nano banana provide better performance and lower hardware requirements for users. Privacy is protected through ephemeral transmission and explicit no-storage contracts with AI providers. Transparency builds trust even when using cloud services.

### III. User Experience Over Technical Complexity

**MUST** design features for non-technical users (parents, family members). **MUST** minimize required user input through:
- Pre-configured prompt templates for common scenarios
- Smart defaults (medium similarity, 3:4 ratio, 4 images per style)
- Single-click workflows for common tasks
- Chinese language primary UI with clear, simple terminology

**MAY** offer advanced modes for power users, but these **MUST** be opt-in and clearly separated from default workflows.

**Rationale**: The primary users are busy parents who want memorable photos, not AI prompt engineers. Complexity kills adoption. The product should feel like a specialized photo app, not a technical tool.

### IV. Graceful Degradation & Error Recovery

**MUST** handle generation failures gracefully with:
- Clear, actionable error messages in user's language
- Specific retry guidance (e.g., "Photo quality too low - try better lighting")
- Ability to retry individual failed generations without losing successful ones
- Progress preservation across app restarts

**MUST** validate inputs before expensive operations (e.g., check photo quality before 30-second generation).

**Rationale**: AI generation can fail due to hardware limitations, photo quality, or model issues. Users should never feel stuck or lose work. Failures should feel recoverable, not catastrophic.

### V. Incremental Value Delivery

**MUST** organize features into independently valuable user stories. Each story **MUST**:
- Deliver standalone value (usable even if other stories aren't implemented)
- Be independently testable
- Have clear success criteria
- Be prioritized (P1 = MVP, P2 = enhancement, P3 = nice-to-have)

**MUST** implement P1 stories completely before starting P2. **MUST** be ready to ship after any P-level completion.

**Rationale**: Parents need working features quickly (baby grows fast!). Incremental delivery enables early user feedback and ensures the most valuable features ship first, even if development is interrupted.

## Privacy & Security Standards

**MUST** implement:
- Sandboxed file access (only user-selected photos)
- Secure deletion (overwrite, not just unlink)
- No telemetry containing personal data (no photo hashes, no prompt text if contains names)
- Clear data retention policies shown during onboarding

**MUST** document in user-facing terms:
- What data is stored and where
- How to completely remove all data
- What happens to photos after generation

**MUST NOT**:
- Access device photos without explicit user selection
- Store photos outside application-controlled directories
- Log or cache personal data in plain text
- Include personal data in crash reports

## Quality & Performance Standards

**MUST** meet:
- **Generation Time**: ≤30 seconds per image on recommended hardware (documented in quickstart)
- **Failure Rate**: <5% on validated photo inputs (defined: well-lit, in-focus, front-facing)
- **Photo Quality Validation**: Pre-generation checks for common issues (blur, extreme angles, poor lighting)
- **Resource Limits**: <2GB disk space per style model, <4GB RAM during generation

**MUST** document:
- Minimum hardware requirements
- Recommended hardware for best experience
- Performance expectations for different configurations

**MUST** test on:
- Low-end hardware (minimum spec)
- Recommended hardware
- Varied photo inputs (different lighting, angles, quality)

## Governance

### Amendment Process

1. **Proposal**: Document proposed change with rationale and impact analysis
2. **Review**: Validate against existing principles and project goals
3. **Impact Assessment**: Identify affected templates, code, and documentation
4. **Approval**: Document decision and reasoning
5. **Migration**: Update constitution, templates, and propagate changes
6. **Versioning**: Increment version per semantic versioning rules

### Versioning Policy

- **MAJOR** (X.0.0): Breaking changes to principles, removed requirements, governance restructuring
- **MINOR** (0.X.0): New principles added, material expansions to guidance, new mandatory sections
- **PATCH** (0.0.X): Clarifications, wording improvements, typo fixes, non-semantic refinements

### Compliance Review

**MUST** verify constitution compliance:
- Before Phase 0 research (gate check)
- After Phase 1 design (re-check)
- During implementation reviews
- Before feature completion

All feature specifications, plans, and tasks **MUST** demonstrate alignment with principles. Violations **MUST** be documented in Complexity Tracking table with justification.

### Runtime Guidance

- Use `.specify/memory/guidance.md` for agent-specific development instructions
- Constitution remains agent-agnostic and technology-agnostic
- Principle adherence applies regardless of implementation assistant or developer

**Version**: 1.0.1 | **Ratified**: 2025-10-08 | **Last Amended**: 2025-10-08
