<!--
SYNC IMPACT REPORT
==================
Version Change: Initial (no previous version) → 1.0.0
Rationale: Initial constitution creation for Pitch Site project

Modified Principles:
- Created 9 new principles from user input (Experience-First Design, Fluid Not Framework,
  Narrative Structure, Dynamic Interaction, Performance as Feature, Targeted Personalization,
  Depth Through Layers, Anti-Pattern Enforcement, Demonstration Through Implementation)

Added Sections:
- Core Principles (9 principles)
- Quality Standards (Visual Excellence, Interaction Design, Content Strategy, Technical Constraints)
- Amendment Process (Major/Minor/Patch)
- Governance (with 5 quality gates)

Templates Status:
- ⚠ plan-template.md: Needs review - Constitution Check section should validate against new principles
- ⚠ spec-template.md: Needs review - User scenarios should align with narrative structure principle
- ⚠ tasks-template.md: Needs review - Task organization should reflect performance and fluid design principles
- ⚠ Command files (.claude/commands/*.md): Generic - no agent-specific updates needed

Follow-up TODOs:
- Review plan-template.md Constitution Check section to add specific gates for fluid design, performance, personalization, anti-patterns, and depth
- Consider adding performance budget validation to tasks-template.md
- Validate that spec-template.md supports the three-act narrative structure (Proven Excellence → Strategic Vision → Immediate Value)
-->

# Pitch Site Constitution

## Core Principles

### I. Experience-First Design

Every element must contribute to creating an unforgettable first impression. The site itself becomes the primary demonstration of capability - showing, not telling. No element exists without purpose; every pixel must earn its place through impact on the viewer's perception.

**Rationale**: In high-stakes pitches, the medium is the message. Technical capability proven through execution is infinitely more convincing than claims in text. First impressions determine whether prospects engage or dismiss.

### II. Fluid, Not Framework

Reject component library aesthetics and rigid grids. Every layout must feel organic and alive, with no rectangular cards, uniform spacing, or predictable animations. Elements breathe, morph, and flow into each other. The site must never appear templated or boilerplate.

**Rationale**: Framework-based designs signal lack of technical depth and creative investment. Custom, fluid implementations demonstrate the level of craft and attention that premium clients expect.

### III. Narrative Structure

Content follows a three-act structure: Proven Excellence → Strategic Vision → Immediate Value. Each section must flow seamlessly into the next through fluid transitions. The story progresses from credibility through understanding to action, never breaking immersion.

**Rationale**: Human cognition processes information through narrative. A structured story arc maintains engagement and guides prospects from skepticism to conviction systematically.

### IV. Dynamic Interaction

Static content is forbidden. Every element responds to user presence through magnetic effects, parallax depth, or reactive animations. Mouse position, scroll progress, and time influence the presentation. Interactions must feel discovered, not instructed.

**Rationale**: Dynamic interaction creates emotional engagement and memorability. Passive consumption leads to forgetting; active discovery creates lasting impressions and demonstrates interactive expertise.

### V. Performance as Feature

Animations must run at 60fps without exception. Initial load time must be under 2 seconds globally. Every transition must feel instantaneous. Performance optimization is not a nice-to-have but a core feature demonstrating technical excellence.

**Rationale**: Performance failures undermine credibility immediately. Claiming technical skill while delivering janky animations or slow loads creates cognitive dissonance that destroys trust.

### VI. Targeted Personalization

Generic messaging is prohibited. Every word must speak directly to the target company's needs, using their terminology and addressing their specific challenges. The site adapts its content, colors, and examples to match the intended audience.

**Rationale**: Generic pitches are ignored. Personalization demonstrates research, understanding, and genuine investment in the specific opportunity. It separates serious contenders from mass applicants.

### VII. Depth Through Layers

Single z-index planes are insufficient. Create dimensionality through multiple depth layers, with foreground, midground, and background elements moving at different speeds. Use 3D space when 2D falls short. Depth creates sophistication.

**Rationale**: Visual depth signals complexity and craft. Flat designs appear simplistic; layered compositions demonstrate mastery of space, motion, and visual hierarchy.

### VIII. Anti-Pattern Enforcement

These patterns are explicitly forbidden:
- Card-based layouts with uniform gaps
- Centered containers with max-width
- Fade/slide/scale as primary animations
- Traditional header/content/footer structure
- Symmetric layouts and even spacing
- Generic hover states (darken/lighten)
- Standard navigation patterns

**Rationale**: Anti-patterns exist to prevent the appearance of template-driven development. Breaking conventions signals custom craft and differentiates from commodity web development.

### IX. Demonstration Through Implementation

Technical capability must be proven through the site's own execution, not claimed through text. Complex animations, 3D visualizations, and fluid interactions serve as live proof of skill. The medium is the message.

**Rationale**: "Show, don't tell" is the cardinal rule of persuasion. Live demonstrations are irrefutable; claims are dismissible. The site itself becomes the portfolio piece.

## Quality Standards

### Visual Excellence

- Every animation MUST use custom easing curves, never linear or default easings
- Colors MUST shift and breathe, never remaining static
- Typography MUST vary in weight, size, and spacing to create rhythm
- Shadows and glows MUST be multi-layered for realistic depth

**Enforcement**: Visual reviews required for all UI implementations. Any default easing curves or static colors flagged for revision.

### Interaction Design

- Custom cursor required with context-aware states
- Scroll MUST be hijacked for controlled, smooth progression
- Loading states MUST be designed experiences, not spinners
- Error states MUST maintain the site's aesthetic language

**Enforcement**: Interaction testing checklist required before merge. All standard browser interactions must be replaced with custom implementations.

### Content Strategy

- Use "we" and "our" instead of "I" and "my" to imply collaboration
- Lead with outcomes and impact, not process and features
- Quantify everything possible with specific metrics
- Include interactive elements (calculators, comparisons, demos)

**Enforcement**: Content reviews verify metric-driven language and collaborative voice. Generic feature lists prohibited.

### Technical Constraints

- Bundle size per route MUST NOT exceed 150KB
- Images MUST use next-gen formats (WebP/AVIF) with fallbacks
- All animations MUST be GPU-accelerated
- Code splitting required for sections loaded below fold

**Enforcement**: Bundle analysis in CI/CD pipeline. Builds fail if route bundles exceed 150KB or non-optimized images detected.

## Amendment Process

### Major Amendments (Breaking Principles)

Amendments that alter core principles require:
1. Documented justification showing why current principle fails
2. Impact analysis on all existing sections
3. Migration plan for affected components
4. Performance benchmarks before and after

**Version Bump**: MAJOR (e.g., 1.0.0 → 2.0.0)

### Minor Amendments (Extending Principles)

Amendments that clarify or extend principles require:
1. Examples demonstrating the need
2. Backward compatibility confirmation
3. Update to relevant quality standards

**Version Bump**: MINOR (e.g., 1.0.0 → 1.1.0)

### Patch Amendments (Clarifications)

Typos, wording improvements, and examples require only documentation of the change.

**Version Bump**: PATCH (e.g., 1.0.0 → 1.0.1)

## Governance

This constitution supersedes all implementation decisions. When technical choices conflict with these principles, the principles win. Every pull request must verify:

1. **Fluid Design Check**: No rigid grids or component library patterns
2. **Performance Check**: 60fps animations and <2s load time maintained
3. **Personalization Check**: Content speaks to specific target audience
4. **Anti-Pattern Check**: None of the forbidden patterns present
5. **Depth Check**: Multiple z-layers and dimensional design verified

**Violations Policy**: Violations MUST be corrected before merge. No exceptions. Code that violates principles will be rejected regardless of functionality.

**Complexity Justification**: Any implementation that appears to violate principles must be documented in the plan.md Complexity Tracking section with explicit rationale.

**Compliance Review Process**:
- Constitution Check conducted before Phase 0 research begins
- Constitution Check repeated after Phase 1 design artifacts complete
- Pull request reviews include constitutional compliance verification
- Performance benchmarks required for all animation implementations

**Version**: 1.0.0 | **Ratified**: 2025-10-27 | **Last Amended**: 2025-10-27
