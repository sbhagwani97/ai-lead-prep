# AI Lead Interview Prep (gated)

Next.js + Clerk, deployable on Vercel Hobby for free. Users sign up / log in, and each user's
ticked tasks are saved to their own account (Clerk private metadata), so progress follows them across devices.

## How it works
- `/` landing page (public). Signed-in users are redirected to `/prep`.
- `/sign-in`, `/sign-up` Clerk screens.
- `/prep` returns the prep page HTML **only after a server-side session check**. The user's saved ticks are injected into the page.
- `/api/progress` (POST) validates the session and saves the tick list (ids like `w3t5`) to the user's Clerk private metadata.
- `proxy.ts` also protects every non-public route, but the routes re-check the session themselves.
- The page template is `content/prep.html`. Edit it to change content.

## Set up (about 10 minutes)
1. Create a free app at https://dashboard.clerk.com (enable Email and/or Google/GitHub sign-in).
2. Copy the Publishable key and Secret key from **API Keys**.
3. Local run:
   ```
   cp .env.example .env.local   # paste your two keys
   npm install
   npm run dev                  # http://localhost:3000
   ```
4. Deploy: push this folder to a GitHub repo, import it at https://vercel.com/new, add the same two
   environment variables (`NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`, `CLERK_SECRET_KEY`), and deploy.
5. In Clerk, add your Vercel domain under **Domains** when you move from the dev instance to production.
   (The dev instance works fine for personal use.)

## Notes
- Free tiers: Vercel Hobby is for personal, non-commercial use. Clerk's free plan covers 50,000 monthly retained users.
- Progress lives in Clerk private metadata (8 KB limit; this uses well under 1 KB).
- To keep strangers out, in Clerk turn off public sign-ups (Restrictions > Allowlist) after you create your account.
