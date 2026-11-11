# Goal Groups

Goal Groups is a place to post a goal, gather spotters and crew, and build a show-up record.

The site runs on Cloudflare Pages, Pages Functions, and D1.

## Layout

- `public/` is the static site (HTML, CSS, JS, and fonts).
- `functions/` is the Pages Functions API.
- `lib/` holds shared helpers used by those functions.
- `wrangler.toml` configures the Pages project and the D1 binding `DB`.
- `schema.sql` initializes the D1 database `goal-groups`.

## Run locally

```
npx wrangler pages dev public
```

Wrangler serves `public/` and attaches the D1 database through the `DB` binding in `wrangler.toml`.

## Deploy

```
npx wrangler pages deploy public --project-name goal-groups
```

## Database

`schema.sql` initializes the D1 database `goal-groups`.
