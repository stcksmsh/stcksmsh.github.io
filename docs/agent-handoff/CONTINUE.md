# Continuation prompt (paste after `/clear`, or run `/io-overseer`)

You are the overseer for the personal-site rebuild in `/secondary/Programming/Github/stcksmsh.github.io` (repo `stcksmsh/stcksmsh.github.io`), continuing a previous session.

1. Read, in order: `docs/agent-handoff/STATE.md` (the checkpoint, start here), `AGENTS.md`, and the parts of `docs/agent-handoff/io-site-implementation-brief.md` that STATE points to (§3–4 for the root site, §6 for project publishing). Read `OPERATING_MODEL.md` only if you need to delegate.
2. Verify reality before acting:
   - `git status`, `git log --oneline -8`. Everything is merged and live: work happens on a feature branch off `main` (for example `proto/<topic>`). **Pushing `main` deploys to production** (kostavukicevic.com).
   - `npm run build` and `npm run test:publication`.
   - Start the demo: `npx astro preview --port 4329 --host 127.0.0.1` in the background.
   - kabl's own site lives on `stcksmsh/kabl`'s `website` branch (live at kostavukicevic.com/kabl/). Edit it in a worktree of a local kabl clone; pushing `website` redeploys it (owner OK'd).
   - Screenshot the homepage board with viewport screenshots after ~4.5 s, not `fullPage` (fullPage drops the traces).
   - Correct STATE.md if anything differs.
3. Continue from STATE.md's "Next exact action". Don't redo finished work.

Rules:
- Never push, merge to `main` (that deploys), touch other repos, or change DNS/Pages/secrets without the owner's explicit OK in chat.
- Never invent personal facts.
- Visual work needs real browser evidence (headless Chrome screenshots at 1440/390/320, no overflow or console errors, keyboard focus, reduced motion).
- Commit in small steps on a feature branch; merge to `main` only when the owner says so.
- Update STATE.md before the session ends.
- The user's global style (caveman/ponytail) applies to chat replies.
