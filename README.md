CSpark Content Studio creates summaries, video scripts, social posts and SEO copy from text or web articles.


<p align="center">
  <img src="public/octopus-logo.png" width="112" alt="CSpark octopus logo" />
</p>

<h1 align="center">CSpark Content Studio</h1>

<p align="center">
  <strong>English</strong> · <a href="README.tr.md">Türkçe</a><br />
  <a href="#run-locally"><strong>Run locally</strong></a> ·
  <a href="https://cspark-app.vercel.app">Project website</a> ·
  <a href="#api-at-a-glance">API reference</a>
</p>

The interface is mainly Turkish, with Turkish and English generation options. You can set the tone, length and video duration, then copy the result or download it as text.

## Content options

- Summaries, YouTube scripts, short-form video scripts, social posts and SEO text.
- Plain-text input or article extraction from a URL.
- Starting prompts for writing, video, social media and SEO conversations.
- A bulk endpoint that requests all five formats and returns whichever succeed.

Video scripts and thumbnail suggestions are text outputs. The app does not create video files or thumbnail images.

## Run locally

Use Node.js compatible with Next.js 15.4.6, such as 20.x or later, and npm.

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

Open [localhost:3000](http://localhost:3000), then go to [the content editor](http://localhost:3000/create). Enter text or a URL, choose a format and review the generated output.

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

## Limitations

- Sign-in is simulated. There is no completed account or authorization system.
- Missing credentials or inference failures can return a canned response with a successful HTTP status. `/api/health` does not confirm that model generation works.
- Source text is trimmed to 4,000 characters before the prompt is built.
- Trends endpoints return placeholder data.
- Article extraction depends on the site's markup and accessibility. Check generated text for factual errors before using it.
- `package.json` has build and lint commands, but no `test` script.

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

For bugs, include the screen or route, input type, generation settings and what happened. Mention whether the response came from the provider or a canned fallback. Remove tokens and private source text.

## License

Code is licensed under [MIT](LICENSE). Models and dependencies have their own terms. The CSpark logo is included in the repository.
