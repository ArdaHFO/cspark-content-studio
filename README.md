CSpark Content Studio turns your text or web articles into summaries, video scripts and social media posts.

<p align="center">
  <img src="public/octopus-logo.png" width="112" alt="CSpark octopus logo" />
</p>

<h1 align="center">CSpark Content Studio</h1>

<p align="center"><strong>One idea. More ways to tell it.</strong></p>
<p align="center">An AI-assisted content creation workspace for summaries, video scripts, social posts and SEO copy.</p>

<p align="center">
  <strong>English</strong> · <a href="README.tr.md">Türkçe</a><br />
  <a href="#run-locally"><strong>Run locally</strong></a> ·
  <a href="https://cspark-app.vercel.app">Project website</a> ·
  <a href="#api-at-a-glance">API reference</a>
</p>

---

Start with text or a web article, choose an output format, and adapt the result for a different audience or channel. CSpark combines a Turkish-first interface with Turkish and English generation options, configurable tone and length, and tools to copy or download generated text.

**This repository contains a web application.** The active frontend calls its own Next.js API routes. The login screen simulates sign-in, and provider failures can return canned sample responses. Read the current limits before treating a response as successful live inference.

## Get started

| Requirement | Repository setup |
| --- | --- |
| Runtime | Node.js compatible with the locked Next.js 15.4.6 release, such as 20.x or later |
| Package manager | npm, with the committed `package-lock.json` |
| AI generation | A Hugging Face token with access to the configured inference provider |
| Interface | Turkish-first UI, Turkish and English generation options |
| Default API | Next.js routes under `/api` |

1. Follow the local setup below and open [localhost:3000](http://localhost:3000).
2. Open the content workspace at [localhost:3000/create](http://localhost:3000/create).
3. Enter text or a supported web URL, choose a content type and generation settings, then review the output before copying or downloading it.

## Inside the workspace

- **Five output formats.** Generate summaries, YouTube scripts, short-form scripts, social posts and SEO text.
- **Text and article input.** Submit plain text or extract text from a URL through the server-side extraction route.
- **Adjustable writing.** Select Turkish or English, tone and length. Video-oriented requests also accept a duration.
- **Template-led conversations.** The agent interface provides starting prompts for writing, video, social and SEO tasks.
- **Multiple outputs from one input.** The bulk endpoint requests all five formats in sequence and returns the successful results.
- **Reusable text.** Copy generated content or download it as a text file.
- **A responsive interface.** Animated components and light/dark presentation support the content workflow.

The scripts and thumbnail guidance are text outputs. This repository does not render finished videos or generate thumbnail image files.

## Run locally

The lockfile records **Next.js 15.4.6**, **React 19.1.0** and **Tailwind CSS 3.4.x**.

```bash
git clone https://github.com/ArdaHFO/cspark-content-studio.git
cd cspark-content-studio
npm ci
```

Create `.env.local` in the repository root. No `.env.example` file is included.

```dotenv
HF_API_TOKEN=your_hugging_face_token
```

Keep the token on the server and outside version control. The active [generation route](app/api/generate/route.ts) calls the Hugging Face Router with `deepseek-ai/DeepSeek-R1-Distill-Qwen-14B:novita`. Availability and access depend on the provider account.

```bash
npm run dev
```

To prepare and serve a production build locally:

```bash
npm run build
npm start
```

The [API client](lib/api.ts) uses relative `/api` URLs. A separate Python server is not required for this path. The [backend directory](backend/) retains an alternative FastAPI implementation and its [earlier setup guide](backend/README.md), with different model defaults.

## API at a glance

| Endpoint | Purpose |
| --- | --- |
| `GET /api/health` | Basic route health response |
| `POST /api/extract` | Extract article text from a `url` |
| `POST /api/generate` | Generate one output from `input`, `task` and optional settings |
| `POST /api/generate-all` | Request all five output formats |

Example request to `POST /api/generate`:

```json
{
  "input": "Your source text",
  "task": "summary",
  "lang": "en",
  "tone": "professional",
  "length": "medium"
}
```

Valid tasks are `summary`, `youtube`, `shorts`, `social` and `seo`. The single-output route returns a `result` string. Bulk generation may omit formats whose requests failed.

## Validation and current limits

This documentation was checked against the repository source and configuration. No application build, browser session or live provider request was run for this update.

- The generation route trims source text to 4,000 characters before constructing the prompt.
- Missing credentials or inference failures may produce a canned response with a successful HTTP status. A health response alone does not verify AI generation.
- The login flow is a UI simulation, not a completed account or authorization system.
- The trends endpoints currently return placeholder data. They are not a verified trends integration.
- There is no `test` script in `package.json`. Build and lint commands are available, but no passing result is claimed here.
- Web extraction depends on the target site's markup and accessibility. Generated content still needs factual and editorial review.

## Project map

```text
app/          Pages, layouts and Next.js API routes
components/   Shared interface and animation components
lib/          Frontend API client and utilities
public/       Existing logos and static assets
backend/      Alternative Python/FastAPI implementation
```

## Documentation and contributions

- [API request types and helpers](lib/api.ts)
- [Generation implementation](app/api/generate/route.ts)
- [Alternative backend guide](backend/README.md)
- [Issues and feature requests](https://github.com/ArdaHFO/cspark-content-studio/issues)

For a reproducible issue, include the route or screen, input type, generation settings and observed behavior. State whether the output came from a configured provider or a fallback. Keep credentials and private source material out of reports. Focused pull requests should explain what changed and how it was checked.

## License and credits

Project code is distributed under the [MIT license](LICENSE). Model access and third-party packages remain subject to their respective terms. The existing CSpark logo is reused from this repository.
