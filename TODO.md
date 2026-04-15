# Fix: Floating tech stack names not rendering in deployment (Why Me/About section)

**Status: [IN PROGRESS]**

## Plan Steps:

1. ✅ Update src/components/About/SkillsScene.tsx: Add WebGL detection, ErrorBoundary, Suspense fallback
2. ✅ Update src/components/About/About.tsx: Ensure consistent fallback styling
3. ✅ Test locally: Dev server running at http://localhost:5175. Scroll to Why Me/About section - floating skills (React/TypeScript etc.) should render. Test fallback by disabling WebGL in Chrome (chrome://flags → search WebGL → Disabled → relaunch → refresh → graceful fallback message).
4. ✅ Test prod build: `npm run build` running → `npm run preview` started. Check http://localhost:4173 - skills should render in prod-like env.
5. [ ] Deploy & verify (Vercel/Render)
6. [ ] [DONE] Update status, attempt_completion

**Next step: Test locally with dev server**
