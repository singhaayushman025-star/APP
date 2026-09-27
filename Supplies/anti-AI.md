# AI Design Guardrails

## Purpose

Use this document as a **strict instruction set for any AI generating or modifying the project's UI/UX**.

The goal is to make the product feel **human-designed, product-specific, restrained, functional, and credible**, rather than like a generic AI-generated landing page.

These rules are mandatory unless the project requirements explicitly override them.

---

# 1. Core Design Principle

Design from the **actual product, actual content, actual user flow, and actual brand identity**.

Do not fill missing information with invented content, generic SaaS patterns, decorative elements, fake proof, or trendy visual effects.

Every visual element must have a reason to exist.

Prefer:
- Clear hierarchy
- Strong information architecture
- Purposeful spacing
- Real product content
- Real screenshots or product states where available
- Practical interactions
- Consistent visual language
- Simple, intentional layouts
- Product-specific visual decisions

Avoid anything that looks like it was added only because it is common in AI-generated websites.

---

# 2. Anti-Hallucination Rules

The AI must **not invent facts, features, statistics, users, companies, reviews, testimonials, partnerships, awards, pricing, security claims, integrations, performance claims, or product capabilities**.

### Never fabricate:
- Customer names
- Testimonials
- User counts
- Revenue numbers
- Accuracy percentages
- Ratings
- Logos
- Brand partnerships
- Reviews
- Case studies
- Awards
- Certifications
- Security claims
- Compliance claims
- Product features that have not been specified
- Product screenshots that imply functionality that does not exist
- Pricing plans that have not been defined
- Fake usage metrics
- Fake social proof

### If information is missing:
1. Do not invent it.
2. Do not replace it with fake marketing copy.
3. Use a neutral placeholder only when absolutely necessary.
4. Prefer removing the section entirely over creating fictional content.
5. Preserve the real information hierarchy even when some data is unavailable.

### Product truth rule
Never design a UI that visually promises functionality the product does not actually provide.

The interface must reflect the **real current state of the product**.

---

# 3. Strictly Prohibited Visual Patterns

Do **not** use the following patterns unless the project requirements explicitly demand a specific one:

- Harsh gradients
- Rainbow coloring
- Neon colors
- Basic pastel color palettes
- Purple-and-black "AI startup" styling
- Liquid Glass / glassmorphism
- Radial gradient orbs
- Decorative dot grids
- Sparkle icons
- Emoji-based UI decoration
- Lucide/icon-library decoration used only for aesthetics
- Drop shadows
- Large floating shadows
- Colored left-side stripes
- Soft excessive corner rounding
- Generic bento grids
- Three feature cards in a row as a default layout
- Three-tier pricing tables
- Fake testimonials
- Fake customer logos
- Fake review cards
- Fake statistics
- Decorative terminal windows
- Terminal/code blocks used only as decoration
- Animated arrows used only to make the page feel dynamic
- Decorative 3D blobs
- Decorative floating shapes
- Glow effects without a functional purpose
- Neon borders
- Excessive blur
- Excessive glass effects
- Decorative sparkle effects
- Random floating badges
- Generic SaaS dashboard mockups with no real product purpose
- Generic AI-generated hero illustrations that do not represent the actual product
- Checkmark bullet lists as a default sales pattern
- "It is not X, it is Y" style marketing copy
- Em dashes (—)
- Generic startup slogans
- Generic AI buzzword-heavy copy
- Overuse of all-caps headings
- Excessive pill-shaped UI elements

---

# 4. Typography Rules

Do not automatically use:
- Inter
- Geist
- Space Grotesk

These fonts should not be selected simply because they are common in AI-generated interfaces.

Choose typography based on the project's actual visual identity.

Prioritize:
- Readability
- Strong hierarchy
- Appropriate line length
- Clear distinction between headings, body text, labels, and metadata
- A consistent type scale

Do not use oversized typography merely to imitate a modern startup landing page.

---

# 5. Color Rules

Use a **restrained, intentional palette**.

Avoid:
- Rainbow palettes
- Neon colors
- Overly saturated accents
- Purple-and-black default AI styling
- Generic pastel gradients
- Multiple unrelated accent colors
- Excessive color variation between sections

Prefer:
- A small number of meaningful colors
- One primary accent when appropriate
- Neutral supporting colors
- High contrast where needed
- Color used to communicate state, hierarchy, or interaction

Every color should have a functional or brand reason.

---

# 6. Background Rules

Do not default to a pure white background simply because it is common in AI-generated designs.

Do not automatically use dark backgrounds either.

Choose the background based on the actual product and visual identity.

Suitable choices may include restrained neutral surfaces, subtle off-whites, soft neutrals, or a controlled brand background.

Do not add gradients, orbs, dot grids, noise textures, or decorative background patterns just to make an empty area look more interesting.

---

# 7. Layout Rules

Do not force the website into a predictable AI-generated SaaS structure such as:

Hero → 3 feature cards → logo strip → testimonials → pricing → CTA

Instead, build the layout around the **actual user journey and product story**.

Use layouts that make sense for the content, such as:
- Editorial sections
- Product walkthroughs
- Process flows
- Comparison tables when genuinely useful
- Screenshots with annotations
- Real dashboards
- Product states
- Task-focused sections
- Documentation-style sections
- Structured content blocks

Do not use a bento grid merely because it is fashionable.

Do not require three equal cards when the content does not naturally form three items.

Do not create symmetry for symmetry's sake.

---

# 8. Feature Presentation Rules

Do not automatically present features as three decorative cards in a row.

Instead, choose a layout based on the feature itself.

Possible alternatives:
- One feature with a large product visual
- Vertical feature sections
- Feature + workflow diagram
- Feature + real screenshot
- Feature comparison
- Side-by-side product states
- Step-by-step interaction flow
- Compact list when the feature set is simple

The number of sections, cards, or columns should come from the content, not from a template.

---

# 9. Product Demonstration Rules

Do not replace a real product demonstration with generic marketing artwork.

When possible, show:
- Real product screenshots
- Real UI states
- Real workflows
- Real interactions
- Real sample data when available
- Actual product behavior

Do not create a fake dashboard or fake interface just to make the page look impressive.

If no real demo exists, use a simple explanation of the workflow rather than inventing a fake product experience.

---

# 10. Testimonials and Social Proof

Do not create fictional testimonials under any circumstance.

Do not invent:
- Names
- Photos
- Job titles
- Companies
- Ratings
- Quotes
- Customer stories

Only display social proof when real source material exists.

If no verified testimonials exist, omit the section.

---

# 11. Pricing Rules

Do not automatically create three pricing tiers.

Do not invent pricing.

Do not invent:
- Free / Pro / Enterprise structures
- Feature limits
- Discounts
- Annual savings
- Trial periods
- Usage limits

Only display pricing that is explicitly provided by the product requirements.

If pricing is not finalized, do not fabricate a pricing table.

---

# 12. Icons and Symbols

Do not use icons as decoration by default.

Avoid:
- Sparkle icons
- Emoji icons
- Generic AI icons
- Random Lucide icons
- Decorative arrows
- Excessive icon badges
- Icon-filled feature cards

Use an icon only when it improves comprehension, navigation, status communication, or interaction.

The icon must have a clear semantic purpose.

---

# 13. Copywriting Rules

Avoid generic AI-generated marketing language.

Do not automatically write phrases such as:
- "The future of..."
- "Powered by AI"
- "Built for the modern..."
- "Supercharge your workflow"
- "Revolutionize your..."
- "Unlock your potential"
- "Experience the future"
- "Seamless, intelligent, effortless"
- "It's not X, it's Y"

Do not use em dashes.

Use direct, specific language based on the actual product.

Prefer:
- What the product does
- Who it is for
- What problem it solves
- How it works
- What the user can actually do

Avoid empty adjectives and exaggerated claims.

---

# 14. Legal and Trust Information

Do not invent legal content.

Do not create fake:
- Terms of Service
- Privacy Policy text
- Security guarantees
- Compliance statements
- Data retention guarantees
- GDPR/DPDP/SOC 2 claims

If the product has real legal documents, link to them.

If they do not exist yet, do not create fictional legal copy simply to make the footer look complete.

---

# 15. Shadows, Borders, and Corners

Do not use drop shadows as the default method of creating depth.

Use:
- Spacing
- Borders when necessary
- Surface contrast
- Typography hierarchy
- Positioning
- Size relationships

Avoid overly soft cards with huge corner radii.

Use restrained corner radii appropriate to the product's visual language.

The UI should feel structured rather than inflated.

---

# 16. Animation Rules

Animation is allowed, but **animation must be functional, not constant decoration**.

### Hover animation policy
Hover effects may be used **only where they help communicate that an element is interactive**.

Examples:
- A button becoming slightly more prominent on hover
- A clickable card changing border or background state
- A navigation item showing a clear active/hover state
- A product screenshot revealing an available interaction

Keep hover effects:
- Subtle
- Fast
- Predictable
- Consistent
- Purposeful

### Do not:
- Add hover animation to everything
- Animate every card
- Animate every text element
- Add constant floating motion
- Add exaggerated scaling
- Add random 3D movement
- Add decorative shimmer
- Add animated arrows everywhere
- Add excessive parallax
- Add animations only because the page feels empty

Animation should support usability, not compete with the content.

---

# 17. Motion and Interaction Quality

Prefer a small number of meaningful interactions over many decorative ones.

Good interaction examples:
- Showing additional product information
- Expanding a real workflow
- Switching between actual product states
- Highlighting the selected navigation item
- Revealing a real action or control

Bad interaction examples:
- Random card lifts
- Constant glowing elements
- Floating decorative objects
- Cursor-following effects with no purpose
- Excessive page transitions
- Every component reacting on hover

---

# 18. Skeleton Loaders

Do not add skeleton loaders just because modern apps often use them.

Use a skeleton loader only when:
1. Content genuinely loads asynchronously, and
2. The loading state improves the actual user experience.

Do not create fake loading states for visual polish.

---

# 19. Authenticity Rules

The design should look like a product made by a thoughtful designer who understands the product.

It should **not** look like:
- A generic AI SaaS template
- A design-system showcase
- A Dribbble concept page
- A startup landing-page template
- A collection of trendy UI effects

Every section should answer one of these questions:
- What does the user need to understand?
- What does the user need to do?
- What does the product need to demonstrate?
- What information helps the user make a decision?

If a visual element does not help answer one of these questions, remove it.

---

# 20. Decision Rule for the AI

Before adding any UI pattern, ask:

**"Would this element still exist if nobody was trying to make the website look modern, futuristic, or impressive?"**

If the answer is no, remove it.

Also ask:

**"Is this based on real product information?"**

If the answer is no, do not invent it.

And ask:

**"Does this interaction improve usability or only add motion?"**

If it only adds motion, remove it.

---

# 21. Final Mandatory Checklist

Before finalizing the design, verify:

- [ ] No hallucinated product information
- [ ] No fake testimonials
- [ ] No fake statistics
- [ ] No fake logos or partnerships
- [ ] No invented pricing
- [ ] No invented legal claims
- [ ] No invented features
- [ ] No harsh gradients
- [ ] No rainbow colors
- [ ] No neon styling
- [ ] No generic pastel palette
- [ ] No purple-and-black default AI look
- [ ] No liquid glass / glassmorphism
- [ ] No radial orbs
- [ ] No dot grids
- [ ] No sparkle icons
- [ ] No emoji decoration
- [ ] No decorative Lucide icons
- [ ] No drop shadows
- [ ] No colored left stripes
- [ ] No generic bento grid
- [ ] No forced three-card feature row
- [ ] No automatic three-tier pricing
- [ ] No fake terminal window
- [ ] No decorative animated arrows
- [ ] No "It's not X, it's Y" copy
- [ ] No checkmark bullets as a generic sales pattern
- [ ] No em dashes
- [ ] No automatic Inter / Geist / Space Grotesk typography
- [ ] No excessive rounded corners
- [ ] No hover effect on everything
- [ ] No decorative animation without a purpose
- [ ] No fake product demos
- [ ] Skeleton loaders only when technically needed
- [ ] Real product content is prioritized
- [ ] Layout is based on the product, not a generic template
- [ ] Every visual element has a purpose

---

# 22. Final Instruction

**Do not hallucinate. Do not decorate for decoration's sake. Do not copy generic AI-generated SaaS patterns. Do not use trendy UI elements as defaults.**

Build the interface from the product's actual requirements, actual content, actual workflows, and actual brand identity.

Use simplicity, clarity, hierarchy, and purposeful interaction as the default.

**Hover animation is the only explicitly encouraged decorative behavior, and even that must be used selectively and only where it communicates interactivity.**

When a choice is uncertain, choose the simpler, more truthful, more product-specific option.
