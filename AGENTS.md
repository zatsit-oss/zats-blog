# AGENTS.md

Guidance for AI agents working in this repository.

**The canonical instructions are in [CLAUDE.md](CLAUDE.md).** Read it before making any
change. This file used to hold its own copy of the same guidance and the two drifted:
the Docusaurus version described a homepage component that no existing commit contained,
which cost a real debugging detour. One source of truth from now on.

The three things worth repeating here, because getting them wrong wastes the most time:

**Content lives in another repository.** Articles, authors and their images are in
[`zatsit-oss/zats-blog-content`](https://github.com/zatsit-oss/zats-blog-content), cloned
as a **sibling directory** and read in place. Nothing is copied into this repo. To write
or fix an article, work there, not here.

**Three checks gate every change**, and they run in CI:

```bash
npm run check        # TypeScript
npm run check:a11y   # WCAG 2.1 AA contrast, both themes
npm run check:eco    # page weight budgets
```

**This codebase has a list of traps that each cost a debugging session**, from the content
store caching rendered Markdown to Astro's scoped CSS never matching script-created
elements. They are written down in CLAUDE.md. Reading that section is cheaper than
rediscovering them.
