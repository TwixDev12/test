# NexusHub

NexusHub is a modern dark-community catalogue for **legal digital resources**: open-source apps, public-domain ebooks and movies, Creative Commons music, indie games, templates, datasets, developer tools and education resources.

## Stack

- Next.js App Router
- Tailwind CSS
- TypeScript
- Prisma ORM
- **MySQL**
- JWT auth demo routes
- Vercel-ready deployment

## Local setup

```bash
cp .env.example .env
npm install
npm run db:generate
npm run dev
```

Open `http://localhost:3000`.

## MySQL setup

Edit `.env`:

```env
DATABASE_URL="mysql://USER:PASSWORD@HOST:3306/nexushub"
JWT_SECRET="replace-with-a-long-random-secret"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
NEXUSHUB_USE_DB="false"
```

For local MySQL:

```bash
mysql -u root -p -e "CREATE DATABASE nexushub CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"
npm run db:push
npm run db:seed
```

Then set:

```env
NEXUSHUB_USE_DB="true"
```

The project works in demo/mock mode when `NEXUSHUB_USE_DB=false`. Keep a valid `DATABASE_URL` value available for Prisma generation, even if it points to a local or hosted MySQL database you enable later.

## Deploy to Vercel

1. Push this folder to GitHub.
2. Import the project on Vercel.
3. Add environment variables:
   - `DATABASE_URL`
   - `JWT_SECRET`
   - `NEXT_PUBLIC_APP_URL`
   - `NEXUSHUB_USE_DB=true` once MySQL is ready
4. Deploy.

Recommended MySQL hosts: PlanetScale, Aiven, Railway, DigitalOcean, AWS RDS, or any MySQL-compatible provider.

## Pages included

- `/` Home
- `/search` Search + filters
- `/resource/[slug]` Resource detail
- `/categories` Category cards
- `/trending` Trending ranking
- `/top-100` Weekly top 100
- `/submit` Resource submission with moderation messaging
- `/auth` Login / Register demo UI
- `/profile` User profile demo
- `/admin` Admin moderation dashboard demo

## API routes included

- `GET /api/resources`
- `POST /api/resources`
- `GET /api/resources/[slug]`
- `POST /api/reports`
- `POST /api/auth/register`
- `POST /api/auth/login`

## Security foundations included

- Server-side validation with Zod
- Basic in-memory rate limiting for submissions/reports/auth
- String sanitization helpers
- Prisma schema with explicit relations and enums
- Moderation status on submitted resources
- Copyright/report flow
- Safe external links with `rel="noopener noreferrer"`

For production, add durable rate limiting with Redis/Vercel KV, email verification, CSRF-aware session handling if using cookies, and object storage validation for uploaded images.
