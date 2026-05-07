# Movie Zone — Node port

A Node implementation of Movie Zone, built on React Router 7 (framework mode), Drizzle, and Postgres.

> **Status:** in active development. This port reproduces the v1.0.0 feature surface of the original Laravel app — see [Why this exists](#why-this-exists) below.

## Why this exists

Movie Zone is a personal film-tracking app, originally built in Laravel — see [ameliaknowscode/amysmoviezone](https://github.com/ameliaknowscode/amysmoviezone) (currently private). That version is feature-frozen at v1.0.0 and serves as the product spec.

This repo is one of three planned re-implementations of that spec on different backends — a portfolio exercise in showing the same product across stacks, and a learning project for the Node ecosystem.

It is **not** a line-by-line translation of the PHP. Each port is built idiomatically for its stack; the divergences from the original are part of the point.

## Stack

- **Framework** — [React Router 7](https://reactrouter.com/) in framework mode (the loader/action model previously known as Remix v2)
- **Language** — TypeScript
- **Database** — Postgres 17, run locally in Docker
- **ORM** — [Drizzle](https://orm.drizzle.team/)
- **Auth** — [Better Auth](https://www.better-auth.com/)
- **Email** — [Resend](https://resend.com/)
- **Styling** — [Tailwind CSS](https://tailwindcss.com/)
- **Tests** — [Vitest](https://vitest.dev/) (unit + component), [Playwright](https://playwright.dev/) (end-to-end)

Hosting is undecided until there is something to deploy. Fly.io is the leading candidate.

## Local development

### Prerequisites

- Node 22+
- Docker (for the Postgres container)

### Database

The dev database runs in a local Docker container. If you don't already have it:

```bash
docker run -d --name moviezone-pg --restart unless-stopped -e POSTGRES_USER=moviezone -e POSTGRES_PASSWORD=test1234 -p 5432:5432 postgres:17
```

Then create the database (one-time):

```bash
docker exec -it moviezone-pg psql -U moviezone -c "CREATE DATABASE moviezone_remix;"
```

### Setup

```bash
cp .env.example .env
npm install
npm run db:migrate
npm run dev
```

The app will be available at [http://localhost:5173](http://localhost:5173).

To insert a few sample movies for development:

```bash
npm run db:seed
```

## License

[MIT](LICENSE).
