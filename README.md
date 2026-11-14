# Kavin Pasupathy — Portfolio

Single-page portfolio for Kavin Pasupathy, a full-stack engineer working on AI-agent systems. It also includes an "Ask about Kavin" chat guide and Career City, a small 3D driving game at `/city`.

Live site: <https://kavin-pasupathy.vercel.app>

## Stack

- Next.js 14 (App Router) and React 18
- Plain CSS with design tokens for a light and a dark theme (`src/app/globals.css`)
- framer-motion for entrance animations, wrapped in `MotionConfig reducedMotion="user"` so the OS "reduce motion" setting is respected
- Three.js for the hero scene, loaded lazily from `src/components/AgentScene.jsx`, and for the Career City game (`src/components/city/`)
- Vercel AI SDK with the Vercel AI Gateway for the chat guide (`src/app/api/chat/route.js`)
- lucide-react icons, `next/font` (Inter, JetBrains Mono), `next/image`
- Vercel Analytics and Speed Insights; deployed on Vercel

## Sections

The page renders in this order (`src/app/page.js`); the header links are plain `#id` anchors to the same ids.

| Section | Id | Component |
| --- | --- | --- |
| Hero | `about` | `TopContainer.jsx` (with `AgentScene.jsx`) |
| Experience | `experience` | `ExperienceContainer.jsx` |
| Projects | `projects` | `ProjectContainer.jsx` |
| Skills | `skills` | `Skillcontainer.jsx` |
| Education & Certification | `education` | `EducationContainer.jsx` |
| Contact | `contact` | `Contact.jsx` |

Projects lists two featured projects, ChatCart AI and BlackSpace AI, followed by three earlier MERN projects in compact cards. The ChatCart AI card shows a diagram of its request flow rather than a screenshot.

Other pieces: `Header.jsx` (navigation, theme toggle, scroll spy via IntersectionObserver, and a link to `/city`), `Footer.jsx`, `BackToTop.jsx`, `MotionProvider.jsx`. The hero also has a "Drive through my resume" button linking to `/city`.

### Career City (`/city`)

A low-poly 3D city with six buildings: Home, Experience, Projects, Skills, Education and Contact. Each opens a card with that part of the resume. Visitors can drive the car themselves (arrow keys or WASD) or take an auto tour that drives for them. A plain-list version is offered for visitors who prefer reduced motion or have no WebGL. The page is `src/app/city/page.js`; the game is in `src/components/city/` and its card copy is in `stops.js`.

### Portfolio guide

A floating "Ask about Kavin" chat button, bottom-right on the home page only (it is not shown on `/city`). It answers questions about Kavin and the site, and can scroll to a section, open the resume, start a guided tour or open `/city`. Requests go to `POST /api/chat`. Without AI Gateway credentials, or if the model call fails, the guide answers from its built-in local responder, so the widget always works. See [AI guide configuration](#ai-guide-configuration).

## Scripts

Requires Node.js 24 (see `engines` in `package.json`).

```bash
npm install
npm run dev     # development server on http://localhost:3000
npm run build   # production build
npm run start   # serve the production build
npm run lint    # next lint
npm run test:guide  # tests for the guide (scripts/test-guide.mjs)
```

## Project structure

- `src/app/` — layout, metadata and JSON-LD, global styles, `robots.js`, `sitemap.js`, 404 page
- `src/components/` — one component and one CSS file per section
- `src/components/guide/` — chat widget (launcher, panel, rich-text rendering)
- `src/components/city/` — Career City game (`CareerCity.jsx`, `CityScene.jsx`, `StopCard.jsx`, `cityMap.js`, `stops.js`)
- `src/app/city/` — the `/city` page
- `src/app/api/chat/route.js` — chat endpoint
- `src/lib/guide/` — guide logic (`config.js`, `prompt.js`, `agent.js`, `respond.js`, `local-responder.js`, `validate.js`, `rate-limit.js`)
- `src/data/profile.js` — the facts and destinations the guide answers from
- `public/assets/` — project images and the downloadable resume

## Editing content

Content lives in arrays at the top of each component (experience entries, projects, skill groups, education items). The theme is set before first paint by an inline script in `src/app/layout.js` and stored in `localStorage`.

## AI guide configuration

The guide calls its model through the Vercel AI Gateway. Copy `.env.example` to `.env.local` for local development and never commit real values.

- On Vercel: nothing to set. Deployments authenticate with the project's OIDC token once AI Gateway is enabled for the team.
- Locally: set `AI_GATEWAY_API_KEY`, or run `vercel link` and `vercel env pull` to get a short-lived `VERCEL_OIDC_TOKEN`.
- `GUIDE_MODEL` (optional): override the gateway model id, in `provider/model` form. The default is `DEFAULT_MODEL_ID` in `src/lib/guide/config.js` (`anthropic/claude-haiku-5.5`).
- `GUIDE_LOCAL_ONLY=1` (optional): never call a model and always use the built-in local responder.

With no credentials, or if the gateway call fails, the guide answers from the local responder (`src/lib/guide/local-responder.js`). Message length, history, output tokens, steps and request time are capped in `LIMITS` in `config.js`.

## Licence

Personal project by Kavin Pasupathy.
