# UX Rules

These rules guide first-draft UX decisions for the web app.

They exist so frontend implementation uses standard, conventional UX patterns by default instead of improvising layout, control hierarchy, state communication, or status treatments slice by slice.

## Source Bias

Prefer consumer-product UX conventions over enterprise business-app defaults unless a reviewed plan says otherwise.

Reference influences:

- shadcn/ui composition patterns
- Radix primitives interaction and accessibility conventions
- Material UI / Material Design control hierarchy and state conventions

Use those conventions as the starting point, but bias toward a consumer app:

- Identity-rich surfaces
- Clear empty states
- Lighter, more welcoming navigation
- Less dense enterprise-style controls
- Cards, sections, and guided flows before admin-style tables where possible

## 1. Default UX Behavior for First Drafts

- Use standard web UX conventions unless an active plan says otherwise.
- Prefer familiar layout, button placement, navigation, and state treatments over clever or novel interaction patterns.
- When product intent is clear but micro-UX details are not, choose the most conventional first draft and surface the assumption in the implementation summary.
- Ask follow-up questions only when the UX choice would materially affect architecture, data model, or the user journey.

## 2. Action Hierarchy

- Each surface should have one clear primary action.
- Secondary actions should be visually quieter than the primary action.
- Destructive actions must be visually distinct from ordinary secondary actions.
- Follow a conventional hierarchy similar to Material-style button treatment:
  - primary action = strongest emphasis
  - secondary supporting action = outline/subtle emphasis
  - tertiary action = text-style or quiet action
- Button labels should use clear verbs. Avoid ambiguous labels like `Continue`, `Submit`, or `Save changes` unless the surrounding context makes the action completely obvious.

## 3. Placement and Layout Conventions

- Keep header controls concise and scannable.
- Menus should contain quick actions or quick switching, not miniature pages.
- Dialogs should stay focused on a single task with clear primary and secondary actions.
- Do not overload compact selector rows with extra icons or multiple competing status indicators when space is tight.
- In constrained navigation components, use subtle visual treatment for status:
  - Muted tone
  - Background shading
  - Text treatment
  - Small status copy only when space allows
- Richer status presentation belongs on larger surfaces such as grid cards, list tiles, settings/manage pages, and full detail panels.
- Prefer card/list/tile layouts for consumer-facing content before reaching for enterprise-style tables.

## 4. Active and Inactive State Rules

- Distinguish clearly between: inaccessible, inactive, empty, loading, and error.
- If an entity still exists and the user can access it, prefer rendering the real page in read-only mode over redirecting to a different page.
- Inactive state should be communicated first at the page level (banner, status panel, disabled action explanation).
- Do not rely on disabled controls alone to communicate inactive state.
- Do not rely on color alone to communicate active/inactive state.
- When controls are disabled, provide nearby explanatory text so the page does not feel broken.

## 5. Menus, Selectors, and Navigation

- Dropdowns and selectors should optimize for fast recognition and low visual noise.
- Compact selector rows should generally show only the minimum identity data (icon/avatar + name).
- Follow Radix/shadcn menu conventions:
  - Grouped actions when categories differ
  - Separators when action meaning changes
  - Submenus only when clearly necessary
- If a status marker is needed in a compact selector, prefer subtle row-level treatment over adding another icon unless the reviewed design explicitly chooses otherwise.
- Navigation items should remain stable across states when possible; avoid moving controls around between active and inactive pages unless the page model truly changes.

## 6. Page-Level State Communication

- Use a page-level message when a whole surface is inactive or read-only.
- Use inline helper text when only one section or action group is affected.
- Preserve the main structure of the page when the page is still meaningful in read-only mode.
- Read-only state should preserve understanding first, then explain why actions are unavailable.
- Error states should explain recovery actions (return to a safe surface, retry, etc.).

## 7. Forms and Validation

- Show validation close to the field that needs attention.
- Prefer inline validation and clear helper text over vague banner-only errors.
- Pending states must be visible: disabled submit, loading text, spinner only when it adds value.
- Preserve consistent button ordering within the same modal or form pattern.
- For modal tasks, keep the primary action in the predictable confirmation position and keep cancellation visually quieter.

## 8. Accessibility Expectations

- Do not rely on color alone to signal status or interactivity.
- Keep semantic controls and keyboard accessibility intact.
- Icon-only actions require an accessible name.
- Disabled or read-only states should still remain understandable to assistive-technology users through visible copy and control semantics.

## 9. Frontend Persona Requirement

The frontend developer persona should use these rules by default when preparing the first implementation draft.

That means:

- Make conventional UX choices proactively.
- Explain important UX assumptions after implementation.
- Suggest best-practice options when a design detail is still open.
- Avoid punting ordinary layout and control decisions back to the user unless the tradeoff is genuinely product-shaping.

## 10. What to Avoid by Default

Unless a reviewed product requirement calls for it, avoid these enterprise-leaning defaults in first drafts:

- Dense admin tables as the first representation of consumer-facing content
- Icon overload in compact navigation surfaces
- Multiple competing primary actions in one panel
- Status communicated only through tiny badges with no surrounding explanation
- Hiding useful read-only information just because editing is unavailable
