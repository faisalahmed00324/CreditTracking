# CreditTracker

CreditTracker tracks credit entries between shops and customers. The backend is an ASP.NET Core API backed by MongoDB; a React web client provides registration, login, dashboards, and credit-entry management.

**Checkout note:** this `main` checkout contains the .NET 9 API, not the React source. The web client is tracked on `copilot/phase-1-codebase-analysis` and other frontend branches. An existing `client/node_modules` or `client/dist` directory alone is not a runnable source checkout. The client instructions below apply to a branch that contains `client/package.json`; use the compatible API from that branch and apply the JWT security fix there before deployment.

## Features

- User registration and authentication (JWT-based)
- OTP verification for new users
- Role-based authorization (Shop, Customer)
- CRUD operations for credit entries
- Pagination support for listing credit entries
- Health checks for MongoDB
- React dashboards and role-protected pages for shops and customers
- Customer search, credit-entry creation, and payment updates in the web client
- Chakra UI components with light/dark theming

## Project Structure

- `src/CreditTracker.Api`: ASP.NET Core Web API endpoints
- `src/CreditTracker.Application`: Application logic, CQRS handlers, DTOs, validation
- `src/CreditTracker.Domain`: Domain models and abstractions
- `src/CreditTracker.Infrastructure`: MongoDB repositories and mappings
- `src/BuildingBlocks/BuildingBlocks`: Shared utilities, CQRS, exception handling
- `tests/CreditTracker.Api.Tests`: JWT configuration and token-validation tests
- `client/` (frontend branches): React web application
  - `src/api/`: Axios client and authentication, user, and credit-entry requests
  - `src/context/`: Authentication state
  - `src/components/`: Shared UI, layout, and route protection
  - `src/pages/`: Login, registration, dashboards, and credit-entry screens
  - `src/test/`: Component and snapshot tests

## Getting Started: API

### Prerequisites

- .NET 9.0 SDK for this checkout (other branches may target a different version)
- MongoDB running locally at `mongodb://localhost:27017`
- OpenSSL for the example random-key generation commands

### Local configuration

`src/CreditTracker.Api/appsettings.json` contains non-secret defaults for the database, JWT issuer, and audience. **Do not add a signing secret to this file or to `launchSettings.json`.**

For local development, generate a new 64-byte random key and store it outside the repository with .NET User Secrets. The project already has a `UserSecretsId`:

```sh
python3 - <<'PY'
import json
import secrets
import subprocess

subprocess.run(
    ["dotnet", "user-secrets", "set", "--project", "src/CreditTracker.Api"],
    input=json.dumps({"JwtSettings:Secret": secrets.token_urlsafe(64)}),
    text=True,
    check=True,
)
PY
```

This example requires Python 3, keeps the secret out of shell history and command-line arguments, and replaces the local key each time it is run. User Secrets are loaded in `Development` and are **not encrypted**; they are not a production secret manager.

Alternatively, configure an environment variable for the API process:

```sh
export JwtSettings__Secret="$(openssl rand -base64 64 | tr -d '\n')"
dotnet run --project src/CreditTracker.Api --launch-profile http
unset JwtSettings__Secret
```

ASP.NET Core maps `__` to `:` and gives environment variables precedence over JSON and User Secrets. It does **not** automatically load `.env` files. Never expose the signing secret through a `VITE_*` variable or any browser bundle.

The API fails at startup if the key is missing, blank, shorter than 32 UTF-8 bytes, or matches the previously exposed key. Length alone does not guarantee entropy: always use a cryptographically random generator. Keys are used as UTF-8 strings, so provide the same exact string to every instance in the same environment. JWT issuer and audience must also be non-empty.

### Build, test, and run

```sh
dotnet build CreditTracker.sln
dotnet test CreditTracker.sln
dotnet run --project src/CreditTracker.Api --launch-profile http
```

- API: `http://localhost:5034`
- Swagger UI: `http://localhost:5034/swagger`
- MongoDB health check: `http://localhost:5034/health`
- HTTPS profile: `dotnet run --project src/CreditTracker.Api --launch-profile https` (HTTPS on port `7289`; trust the local certificate with `dotnet dev-certs https --trust`)

Database defaults are `mongodb://localhost:27017` and `CreditTrackerDb`. Override them with `Database__Connection` and `Database__Name`. Inject connection strings containing credentials through protected configuration, not committed JSON.

### Deployment and exposed-key response

1. Treat the previously committed JWT key as compromised. Provision a **new, unique key per environment** in your deployment secret manager and inject it as `JwtSettings__Secret` at runtime. Do not put it in Docker build arguments, images, CI logs, or committed configuration.
2. Restart or redeploy **every** API instance with only the new key. The API shares one startup key between token issuance and validation; key changes require a restart. Do not retain the compromised key as a validation fallback.
3. Existing tokens signed with the old key must be rejected, even if they have not expired. Users must sign in again. Verify this against the deployed service and review authentication/activity logs for possible misuse.
4. Coordinate a separate Git-history cleanup. The exposed key was introduced in commit `7f57273` and also occurs in a test file on other refs. Removing it from the latest JSON does not remove it from earlier commits.
5. In a separate, fully fetched mirror clone, scan all branches and tags and use a tool such as `git-filter-repo` with a private replacement file outside the repository to replace the exposed value across history. Secure any audit clone because it still contains the exposed key. Review and approve the affected refs before any force-push; history rewriting changes commit IDs and requires collaborator coordination.
6. Rescan rewritten history and coordinate clean clones for collaborators. Review PR refs, hosted caches, artifacts, and forks; contact the hosting provider where needed. Public copies may remain, so history rewriting never substitutes for key rotation.

The development key is not a production replacement key. Rotation in this checkout does not update deployed services or other branches automatically.

## Getting Started: React Client

### Stack and prerequisites

The client on `copilot/phase-1-codebase-analysis` uses React 19, Vite 8, Chakra UI 2, React Router, and Axios, with Vitest and React Testing Library for tests. Use Node.js 22.12+ (or another version supported by Vite 8) and npm. These details refer to that branch; check `client/package.json` if using a different frontend branch.

### Install, develop, and build

From a checkout containing the frontend source:

```sh
cd client
npm ci
npm run dev
```

The development server runs at `http://localhost:3000`. Start the compatible API and MongoDB separately.

```sh
npm run build       # Production files in client/dist
npm run preview     # Preview the production build locally
npm test            # Component and snapshot tests
npm run test:watch  # Watch mode
```

### API connection and authentication

- `client/src/api/client.js` currently sets the API base URL to `http://localhost:5034`; it does not read a `VITE_API_URL` setting. Change that non-secret URL when deploying against another API host.
- The client attaches the JWT from browser storage as `Authorization: Bearer ...`. A `401` response clears stored authentication and redirects to login.
- `src/context/AuthContext.jsx` manages authentication state; `ProtectedRoute` gates authenticated pages and shop-only entry creation. The API remains responsible for enforcing authorization.
- Serve production traffic over HTTPS. Never include the JWT **signing key** in frontend configuration; the browser needs only tokens issued by the API.
- Cross-origin requests require the compatible backend to allow the web client's origin. This API-only checkout does not configure CORS. Do not use a wildcard production policy as a shortcut.
- Vite's `/api` proxy does not affect the current absolute Axios base URL. If switching to a same-origin proxy, align the Axios base URL, proxy target, API scheme/port, and route rewriting; the current proxy target uses HTTPS on port `5034`, while the API's HTTP profile uses HTTP on that port.
- A production static host must fall back to `index.html` for React Router paths such as `/dashboard`.

### Common issues

- **`npm ci` cannot find `package.json`:** the checkout does not contain frontend source; ignored dependencies/build files are not sufficient.
- **API fails before starting:** configure a fresh JWT key and check issuer/audience. A stale environment variable overrides User Secrets.
- **Empty data or failed requests:** confirm MongoDB and the API are running, inspect the API base URL, and check CORS and certificate errors in the browser console.
- **Login required after rotation:** expected; the old token can no longer authenticate.

## Usage

- Register a new user (role: Customer)
- Login to receive JWT token
- Use token to access protected endpoints for credit entry management

## License

Licensed under the [MIT License](LICENSE).
