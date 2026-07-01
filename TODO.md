# Deployment & Fix TODO

## Goal
Make the deployed Next.js frontend successfully connect to the deployed Render backend so login/signup/etc work (no “Failed to fetch”).

## Steps
- [ ] Inspect key runtime config in frontend and backend (API URL, rewrites, CORS policy, auth routes)
- [ ] Identify root cause for “Failed to fetch” (likely CORS origin mismatch)
- [ ] Update backend CORS to accept Vercel production + preview origins reliably (regex-based), not a single hardcoded FRONTEND_URL
- [ ] Rebuild & redeploy backend to Render
- [ ] Verify /health endpoint works
- [ ] Verify auth endpoints: /auth/login, /auth/firebase, /auth/register (if enabled), /auth/refresh, /auth/me
- [ ] Verify feature endpoints: communities, events, posts, uploads, profile, comments, notifications, bookmarks, etc.
- [ ] Deploy frontend to Vercel with correct NEXT_PUBLIC_API_URL (or rely on runtime-safe PROD_API_URL)
- [ ] Re-test deployed frontend end-to-end; fix remaining errors iteratively until fully functional
- [ ] Produce final report: Frontend URL, Backend URL, Health URL, GitHub repo URL, confirmations, and summary of changes

