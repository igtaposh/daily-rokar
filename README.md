# DailyRokar Daily Rokar

DailyRokar is a shop-ledger application for recording sales, expenses, and AEPS transactions. This directory contains the browser-based React application. It provides the public landing page, account flows, and an authenticated dashboard that communicates with the DailyRokar backend.

## Contents

- [What the DailyRokar does](#what-the-DailyRokar-does)
- [Features](#features)
- [Technology](#technology)
- [Requirements](#requirements)
- [Setup](#setup)
- [Environment variables](#environment-variables)
- [Development and production](#development-and-production)
- [Application routes](#application-routes)
- [Dashboard behavior](#dashboard-behavior)
- [Authentication and API communication](#authentication-and-api-communication)
- [Project structure](#project-structure)
- [Pricing and hosting](#pricing-and-hosting)
- [Developer and license](#developer-and-license)
- [Current limitations](#current-limitations)

## What the DailyRokar does

The DailyRokar lets shop users create an account, verify their email, sign in, and manage a daily ledger through a responsive dashboard. The dashboard retrieves transaction and profile data from the backend; it does not persist the business ledger independently in the browser.

## Features

- Public landing page with an overview of the application and its current features.
- Account registration, email-code verification, login, logout, and password recovery flows.
- Authenticated dashboard route, with unauthenticated visitors directed to an authorization page.
- User profile editing and password-management interface.
- Creation of sales, expenses, and AEPS transactions.
- Cash and online balance summaries for Rokar and AEPS, based on the user profile returned by the API.
- Date presets for today, the last seven days, and the current month, plus a custom date-range calendar.
- Sales and expense summaries, with cash and online payment totals.
- Recent sales/expense and AEPS transaction lists with transaction-type filtering for ledger entries.
- Seven-day cash-flow chart, independent of the selected dashboard date range.
- WhatsApp help button available across DailyRokar routes with a prefilled support message.
- Terms and Conditions, unauthorized-access, and not-found pages.
- Responsive layouts styled with Tailwind CSS utilities.

## Technology

- React 19
- React Router 7
- Vite
- Tailwind CSS 4 with the Vite plugin
- Axios for API requests
- React Icons
- ESLint

## Requirements

- Node.js (use a current LTS release)
- npm
- The DailyRokar backend running locally or deployed to a reachable URL

## Setup

From this directory:

```bash
npm install
```

Optionally create a `.env` file to configure the backend URL:

```dotenv
VITE_API_URL=http://localhost:3000/v1/api
```

Start the Vite development server:

```bash
npm run dev
```

Vite prints the local development URL when ready (normally `http://localhost:5173`).

## Environment variables

| Variable       | Required | Purpose                                                           |
| -------------- | -------- | ----------------------------------------------------------------- |
| `VITE_API_URL` | No       | Backend API base URL. Defaults to `http://localhost:3000/v1/api`. |

Vite exposes variables prefixed with `VITE_` to browser code. Do not put private keys, database credentials, or other server secrets in DailyRokar environment variables.

The backend must allow the DailyRokar origin through its CORS configuration. For local development, configure the backend `FRONTEND_URL` to match the Vite origin.

## Development and production

Run the development server:

```bash
npm run dev
```

Run ESLint:

```bash
npm run lint
```

Create a production bundle:

```bash
npm run build
```

Preview the production bundle locally:

```bash
npm run preview
```

The generated production files are written to `dist/`. Deploy that directory to a static web host and set `VITE_API_URL` to the deployed backend API base URL when building the DailyRokar.

## Application routes

| Path               | Page                  | Access                                                     |
| ------------------ | --------------------- | ---------------------------------------------------------- |
| `/`                | Landing page          | Public                                                     |
| `/login`           | Sign-in form          | Public                                                     |
| `/signup`          | Account registration  | Public                                                     |
| `/verify-email`    | Email verification    | Public                                                     |
| `/forgot-password` | Password recovery     | Public                                                     |
| `/dashboard`       | Shop dashboard        | Requires a user profile and token in DailyRokar auth state |
| `/unauthorized`    | Sign-in-required page | Public                                                     |
| `/terms`           | Terms & Conditions    | Public                                                     |
| Any unmatched path | Not-found page        | Public                                                     |

The dashboard route is gated in `App.jsx`. The backend still authorizes protected data and mutation requests; the DailyRokar route check is not a substitute for API authentication.

## Dashboard behavior

The dashboard loads the user profile and fetches ledger information from the backend. The date controls request a selected period for sales/expenses and AEPS records. The available ranges are:

- Today
- Last 7 days
- This month
- Custom start and end dates

The cash-flow chart separately requests the last seven days through today and does not change when the user selects another dashboard date range.

The dashboard stores fetched AEPS transactions in the AEPS context and refreshes them when the selected date range changes or a transaction is created or deleted. Recent sales, expenses, and AEPS transactions can be deleted; deleting an entry reverses its corresponding displayed balance change. Rokar and AEPS balance cards are shown together at the top of the dashboard. When a sale or expense is created successfully, the DailyRokar updates the profile balance shown in the UI using the balances returned by the backend (or a local calculation if the response does not include them). For AEPS transactions, withdrawals increase the AEPS online balance and deposits increase the AEPS cash balance. The backend is authoritative for persisted balances.

The landing page's transaction preview is illustrative sample content; it is not live user data.

## Authentication and API communication

Axios is configured in `src/api/axiosInstance.js` with:

- API base URL from `VITE_API_URL`, or the local backend default.
- JSON request headers.
- Credentialed requests so the backend's HTTP-only authentication cookie can be sent.
- A Bearer token from browser storage when present.
- Unauthorized/forbidden response handling that clears stored auth state and redirects away from the dashboard to sign-in.

The auth context initializes the user and token from `localStorage` and keeps them synchronized when the application updates either value. When a saved token is present on the landing page, the sign-in/create-account buttons call the backend token-refresh endpoint. A valid token is renewed for a 24-hour session and the user is taken to the dashboard; an invalid/expired token allows the visitor to continue to the selected account page.

Use HTTPS in production. Browser storage is accessible to client-side JavaScript; do not treat a DailyRokar token or route guard as a security boundary. Protect data and actions on the backend.

## Project structure

```text
DailyRokar/
├── index.html
├── package.json
├── vite.config.js
└── src/
    ├── api/
    │   └── axiosInstance.js
    ├── assets/
    │   ├── bg.jpg
    │   └── logo.svg
    ├── components/
    ├── context/
    │   ├── AuthContext.jsx
    │   └── RecordContext.jsx
    ├── pages/
    │   ├── Dashboard.jsx
    │   ├── ForgotPassword.jsx
    │   ├── LandingPage.jsx
    │   ├── Login.jsx
    │   ├── NotFoundPage.jsx
    │   ├── Signup.jsx
    │   ├── TermsAndConditions.jsx
    │   ├── UnauthorizedPage.jsx
    │   └── VerifyEmail.jsx
    ├── App.css
    ├── App.jsx
    └── main.jsx
```

## Pricing and hosting

This DailyRokar does not implement subscriptions, billing, payment collection, or paid plans. **No DailyRokar product pricing is defined by the DailyRokar code.** Hosting the DailyRokar or backend, using a domain, storing data in MongoDB, or sending email may incur costs charged by the providers selected for deployment.

## Developer and license

- **Product:** DailyRokar
- **Developed by:** Project contributors. Individual or organization attribution is not specified in the DailyRokar repository; update this section with the maintainers' preferred attribution.
- **License:** The DailyRokar package is marked `private` and does not specify a license. Confirm the intended repository-wide license before granting reuse rights or describing the project as open source.

## Current limitations

- There is no DailyRokar automated test script configured in `package.json`.
- Full linting may report existing issues in other DailyRokar files; run `npm run lint` to check the current state.
- No deployment provider or production API URL is configured in this directory.
- The landing-page preview uses sample data and should not be interpreted as a live account preview.
- Account security, token validation, and all durable data operations depend on the backend API.
