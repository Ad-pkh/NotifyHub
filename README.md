# NotifyHub

NotifyHub is a multi-tenant event delivery platform built with a Node.js + Express backend and a React dashboard frontend.

A tenant can:
- register and log in
- generate an API key
- create event subscriptions
- publish events into NotifyHub
- fan those events out to email and webhook destinations
- inspect event history and delivery logs from the dashboard

## What It Does

The main idea is:

1. A tenant publishes an event to `POST /api/v1/events` using an API key.
2. NotifyHub stores the event and accepts it immediately.
3. The event processor finds all matching active subscriptions for that tenant and event type.
4. NotifyHub delivers the event to every matching channel:
   - email
   - webhook
5. Delivery attempts are recorded in delivery logs with status, attempts, and error details.

This means one event publish can trigger multiple downstream deliveries automatically.

## Features

- Multi-tenant auth with JWT access and refresh tokens
- API key based event ingestion
- Email delivery via SMTP and Nodemailer
- Webhook delivery with signing secret support
- Delivery logs for each subscription attempt
- Retry support for failed or partial events
- Subscription management with active/inactive toggle
- Dashboard with overview stats, event list, event detail view, and test publisher
- Official shadcn UI based frontend setup

## Tech Stack

### Backend

- Node.js
- Express 5
- MongoDB + Mongoose
- Zod
- JWT
- bcryptjs
- Axios
- Nodemailer
- Handlebars

### Frontend

- React 18
- Vite
- TypeScript
- React Router v6
- Tailwind CSS v4
- shadcn/ui
- Axios

## Project Structure

```text
MERN/
├── client/                      # React dashboard
└── server/                      # Express API
    ├── app.js
    ├── server.js
    └── src/
        ├── app.routes.js
        ├── lib/
        ├── middleware/
        └── modules/
            ├── auth/
            ├── event/
            ├── notification/
            ├── stats/
            └── subscription/
```

## Core Flow

### 1. Tenant auth

- `POST /api/auth/register`
- `POST /api/auth/login`
- `POST /api/auth/refresh`
- `POST /api/auth/logout`
- `POST /api/auth/api-key`

The dashboard uses JWT auth. The event ingestion endpoint uses API key auth.

### 2. Subscription setup

A tenant creates subscriptions such as:

- `order.created` -> email -> `alerts@example.com`
- `order.created` -> webhook -> `https://example.com/webhook`

Each matching subscription becomes one delivery route when the event arrives.

### 3. Event publish

An external system or the dashboard test publisher sends:

```http
POST /api/v1/events
X-API-Key: <tenant-api-key>
Content-Type: application/json
```

```json
{
  "eventType": "order.created",
  "payload": {
    "orderId": "ORD-1001",
    "amount": 500
  },
  "idempotencyKey": "order-created-ORD-1001"
}
```

### 4. Fan-out delivery

NotifyHub matches active subscriptions by:

- `tenantId`
- `eventType`

Then it attempts delivery to all matching destinations.

### 5. Event monitoring

The dashboard provides:

- stats overview
- subscription CRUD
- event list
- event detail
- delivery log inspection
- retry action for failed or partial events

## API Overview

### Auth

- `POST /api/auth/register`
- `POST /api/auth/login`
- `POST /api/auth/refresh`
- `POST /api/auth/logout`
- `POST /api/auth/api-key`

### Subscriptions

- `GET /api/subscriptions`
- `POST /api/subscriptions`
- `GET /api/subscriptions/:id`
- `PUT /api/subscriptions/:id`
- `DELETE /api/subscriptions/:id`
- `PATCH /api/subscriptions/:id/toggle`

### Events

- `POST /api/v1/events`
- `GET /api/events`
- `GET /api/events/:id`
- `POST /api/events/:id/retry`

### Stats

- `GET /api/stats/overview`

## Response Format

Success responses:

```json
{
  "success": true,
  "data": {}
}
```

Error responses:

```json
{
  "success": false,
  "message": "Something went wrong",
  "statusCode": 400
}
```

Validation errors are routed through the shared error pipeline so frontend error handling stays consistent.

## Environment Variables

Create a `.env` file in `server/` for backend config.

Typical backend variables:

```env
PORT=8000
MONGODB_URL=your_mongodb_connection_string
DBNAME=your_database_name

JWT_ACCESS_SECRET=your_access_secret
JWT_REFRESH_SECRET=your_refresh_secret

SMTP_HOST=your_smtp_host
SMTP_PORT=587
SMTP_USERNAME=your_smtp_username
SMTP_PASSWORD=your_smtp_password
SMTP_FROM=no-reply@notifyhub.local
SMTP_SECURE=false
SMTP_TIMEOUT_MS=15000

FRONTEND_URL=http://localhost:5173
```

Create a `.env` file in `client/` for frontend config:

```env
VITE_API_URL=http://localhost:8000
```

## Local Setup

### 1. Install backend dependencies

```bash
cd server
npm install
```

### 2. Install frontend dependencies

```bash
cd ../client
npm install
```

### 3. Start the backend

```bash
cd ../server
npm run dev
```

Backend default URL:

```text
http://localhost:8000
```

### 4. Start the frontend

```bash
cd ../client
npm run dev
```

Frontend default URL:

```text
http://localhost:5173
```

## How To Test The Full Flow

### Option 1: End-to-end through dashboard

1. Register a tenant
2. Log in
3. Generate an API key from the dashboard
4. Create an email subscription or webhook subscription
5. Use the Test Event Publisher on the dashboard
6. Open Events and inspect the delivery logs

### Option 2: API + Postman

1. Register and log in
2. Generate an API key using the authenticated auth endpoint
3. Create subscriptions with JWT auth
4. Publish an event to `POST /api/v1/events` using `X-API-Key`
5. Inspect event status and delivery logs with JWT auth

### Email testing

Use Mailtrap or another SMTP provider, then:

- create an `email` subscription
- publish a matching event
- confirm message delivery in the provider inbox

### Webhook testing

Use a webhook catcher such as `webhook.site`, then:

- create a `webhook` subscription
- publish a matching event
- confirm payload receipt in the target URL

## Backend Notes

- Event ingestion returns quickly and processes delivery asynchronously
- API key authentication uses an indexed tenant lookup flow instead of scanning all tenants
- Event and delivery log models use timestamps for reliable ordering
- Duplicate active subscriptions are guarded against
- Switching a subscription to webhook provisioning also ensures a signing secret is available
- SMTP connectivity is verified on server startup so mail issues surface earlier

## Frontend Notes

- Protected routes require `nh_token` in local storage
- Refresh token support is used to avoid unnecessary logout on normal auth expiry
- API key publishing is isolated from the JWT interceptor flow so publish failures do not wrongly log the user out
- The UI uses official shadcn-generated primitives with project-specific styling layered on top

## Current Status

This project is in a strong MVP state and already supports the full core loop:

- onboard tenant
- configure subscription
- publish event
- deliver by email and webhook
- inspect logs
- retry failed delivery

