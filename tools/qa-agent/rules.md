# UX Evaluation Rules

When reviewing a page or flow, evaluate against the following 7 dimensions. Each issue is classified by severity.

## Severity Levels

| Level | Label       | Meaning                                              |
| ----- | ----------- | ---------------------------------------------------- |
| 🔴    | Critical    | User is blocked or may lose funds/assets             |
| 🟠    | Major       | User is seriously confused, may abandon the flow     |
| 🟡    | Minor       | Causes friction but user can still complete the task |
| 🔵    | Enhancement | Nice-to-have, improves overall experience            |

## Evaluation Dimensions

### 1. Confusing UX

- Label or button text is unclear
- Flow is not intuitive — user does not know the next step
- Inconsistent patterns across pages
- Icons without labels, ambiguous meaning

### 2. Missing Context

- DeFi terminology has no tooltip or explanation
- Numbers lack units or unclear currency
- Missing "Learn more" links for complex concepts
- No explanation of why an action is needed (e.g., token approval)

### 3. Cognitive Load

- Too much information on a single screen
- No visual hierarchy — everything has the same weight
- User must remember information from a previous screen
- Too many options presented at once without a recommendation

### 4. Trust & Safety

- User does not understand risks before executing
- Missing confirmation step for high-value actions
- Contract address or verification status not shown
- Warning messages are unclear or missing
- Cannot distinguish real tokens from scam tokens

### 5. Onboarding

- New user does not know where to start
- Missing empty state guidance
- No progressive disclosure
- Assumes user already knows concepts without explanation

### 6. Error Recovery

- Error message is not actionable — only says "Error" without guidance
- No retry mechanism
- User cannot tell if a transaction is pending or failed
- No fallback when the network is congested

### 7. Wording & Copy

- CTA is vague (e.g., "Submit" instead of "Swap 100 USDC → ETH")
- Text is too long, user will not read it
- Inconsistent terminology (uses both "Swap" and "Exchange")
- Tone is inappropriate (too casual for a financial action)

## Output Format

Each issue must follow this format:

```
### [Severity] [Dimension] — Short title

**Where:** Specific page or component
**Persona affected:** New user / Experienced / Both
**Issue:** Description of the problem
**Impact:** How the user is affected
**Suggestion:** Recommended fix
**Priority:** P0 / P1 / P2 / P3
```

## Priority Matrix

|              | High Impact               | Low Impact        |
| ------------ | ------------------------- | ----------------- |
| **Easy Fix** | P0 — Fix immediately      | P2 — Backlog      |
| **Hard Fix** | P1 — Plan for next sprint | P3 — Nice-to-have |
