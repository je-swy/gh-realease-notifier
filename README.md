# GitHub Release Notifier

A service for subscribing to email notifications about new releases of GitHub repositories.

## How It Works

1. User subscribes via the web form or API — provides email and repository
2. Service validates the repository exists via GitHub API
3. A confirmation email is sent with a unique link
4. After confirmation — subscription becomes active
5. Every 10 minutes, the Scanner checks for new releases across all active subscriptions
6. When a new release is detected — subscriber receives an email notification

## Tech Stack

- **Node.js + Express** — web server and API
- **PostgreSQL** — subscription storage
- **Nodemailer** — email delivery
- **node-cron** — background Scanner (every 10 minutes)
- **axios** — GitHub API requests
- **Docker + docker-compose** — containerization
- **Jest** — unit tests

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/subscribe` | Subscribe to repository releases |
| GET | `/api/confirm/:token` | Confirm subscription |
| GET | `/api/unsubscribe/:token` | Unsubscribe via email link |
| POST | `/api/unsubscribe` | Unsubscribe via email + repo |
| GET | `/api/subscriptions?email=` | List subscriptions by email |

## Project Structure

```bash
src/
├── index.js      # Entry point — starts server and runs migrations
├── routes.js     # API route handlers
├── db.js         # PostgreSQL connection pool
├── github.js     # GitHub API client (repo validation, release fetching)
├── mailer.js     # Email sender (confirmation and release notifications)
└── scanner.js    # Background process for checking new releases
migrations/
└── 001_init.sql  # Subscriptions table schema
public/
└── index.html    # Web form for subscribing
└── success.html  # Success page + unsubscribe form
tests/
├── github.test.js  # GitHub client unit tests
└── routes.test.js  # Input validation unit tests
```

## Getting Started

### Prerequisites
- Docker and Docker Compose
- GitHub Personal Access Token (optional but recommended)
- SMTP credentials (Gmail App Password or Resend)

### Run Locally

1. Clone the repository
2. Copy `.env.example` to `.env` and fill in your values
3. Start the service:

```bash
docker compose up --build
```

The service will be available at `http://localhost:3000`

## Environment Variables

| Variable | Description |
|----------|-------------|
| `PORT` | Server port (default: 3000) |
| `DB_HOST` | PostgreSQL host |
| `DB_PORT` | PostgreSQL port |
| `DB_NAME` | Database name |
| `DB_USER` | Database user |
| `DB_PASSWORD` | Database password |
| `GITHUB_TOKEN` | GitHub token (optional — increases rate limit to 5000 req/hr) |
| `SMTP_HOST` | SMTP server host |
| `SMTP_PORT` | SMTP server port |
| `SMTP_USER` | Sender email address |
| `SMTP_PASS` | Email password or App Password |
| `BASE_URL` | Public URL of the service |

> **Note:** If using [Resend](https://resend.com) as SMTP provider, 
> emails can only be sent from your verified email address on the free plan.
> To send from a custom domain, domain verification is required.

## Running Tests

```bash
  npm test
```

## Scanner Logic

The Scanner runs every 10 minutes and:
1. Fetches all confirmed subscriptions from the database
2. Groups them by repository to minimize GitHub API calls
3. Fetches the latest release for each repository
4. If `last_seen_tag` differs from the latest tag — sends a notification email and updates the database
5. If GitHub returns `429 Too Many Requests` — stops scanning until the next scheduled run

## Live Demo

🌐 [Railway](https://gh-realease-notifier-production.up.railway.app/)

