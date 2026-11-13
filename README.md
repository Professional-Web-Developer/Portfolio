# Kavin Pasupathy — Portfolio

Single-page portfolio for Kavin Pasupathy, a full-stack engineer working on AI-agent systems.

Live site: <https://kavin-pasupathy.vercel.app>

## Stack

- Next.js 14 (App Router) and React 18
- Plain CSS with design tokens for a light and a dark theme (`src/app/globals.css`)
- framer-motion for entrance animations, wrapped in `MotionConfig reducedMotion="user"` so the OS "reduce motion" setting is respected
- Three.js for the hero scene, loaded lazily from `src/components/AgentScene.jsx`
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

Other pieces: `Header.jsx` (navigation, theme toggle, scroll spy via IntersectionObserver), `Footer.jsx`, `BackToTop.jsx`, `MotionProvider.jsx`.

## Scripts

Requires Node.js 24 (see `engines` in `package.json`).

```bash
npm install
npm run dev     # development server on http://localhost:3000
npm run build   # production build
npm run start   # serve the production build
npm run lint    # next lint
```

## Project structure

- `src/app/` — layout, metadata and JSON-LD, global styles, `robots.js`, `sitemap.js`, 404 page
- `src/components/` — one component and one CSS file per section
- `public/assets/` — project images and the downloadable resume

## Editing content

Content lives in arrays at the top of each component (experience entries, projects, skill groups, education items). The theme is set before first paint by an inline script in `src/app/layout.js` and stored in `localStorage`.

## Licence

Personal project by Kavin Pasupathy.
