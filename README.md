# Twist SDK TypeScript

<p align="center">
  <img src="./website/static/img/twist-logo.png" alt="Twist Logo" width="100" />
</p>

This is the official TypeScript SDK for the Twist REST API.

## Installation

```bash
npm install @doist/twist-sdk
```

## Usage

An example of initializing the API client and fetching a user's information:

```typescript
import { TwistApi } from '@doist/twist-sdk'

const api = new TwistApi('YOUR_API_TOKEN')

api.users.getSessionUser()
    .then((user) => console.log(user))
    .catch((error) => console.log(error))
```

### OAuth 2.0 Authentication

For applications that need to access user data, use OAuth 2.0:

```typescript
import { getAuthorizationUrl, getAuthToken, TwistApi } from '@doist/twist-sdk'

// Step 1: Generate authorization URL
const authUrl = getAuthorizationUrl(
    'your-client-id',
    ['user:read', 'channels:read'],
    'state-parameter',
    'https://yourapp.com/callback'
)

// Step 2: Exchange authorization code for access token
const tokenResponse = await getAuthToken({
    clientId: 'your-client-id',
    clientSecret: 'your-client-secret',
    code: 'authorization-code',
    redirectUri: 'https://yourapp.com/callback'
})

// Step 3: Use the access token
const api = new TwistApi(tokenResponse.accessToken)
const user = await api.users.getSessionUser()
```

## Documentation

For detailed documentation, visit the [Twist SDK Documentation](https://doist.github.io/twist-sdk-typescript/).

For information about the Twist REST API, see the [Twist API Documentation](https://developer.twist.com/v3/).

## Development and Testing

This project uses [ts-node](https://github.com/TypeStrong/ts-node) for local development and testing.

- `npm install`
- Add a file named `scratch.ts` in the `src` folder
- Configure your IDE to run the scratch file with `ts-node` (instructions for [VSCode](https://medium.com/@dupski/debug-typescript-in-vs-code-without-compiling-using-ts-node-9d1f4f9a94a), [WebStorm](https://www.jetbrains.com/help/webstorm/running-and-debugging-typescript.html#ws_ts_run_debug_server_side_ts_node)), or run it directly: `npx ts-node ./src/scratch.ts`

Example scratch.ts file:

```typescript
import { TwistApi } from './twist-api'

const token = 'YOUR_API_TOKEN'
const api = new TwistApi(token)

api.workspaces.getWorkspaces()
    .then((workspaces) => {
        console.log(workspaces)
    })
    .catch((error) => console.error(error))
```

## Scripts

- `npm test` - Run tests
- `npm run test:watch` - Run tests in watch mode
- `npm run test:coverage` - Run tests with coverage
- `npm run build` - Build the package
- `npm run type-check` - Type check without building
- `npm run lint:check` - Check code style
- `npm run format:check` - Check formatting

## Releases

This package follows semantic versioning. Currently in alpha release (0.1.0-alpha.x).

To publish an alpha version:

```bash
npm version prerelease --preid=alpha
npm publish --tag alpha
```

## Feedback

Any feedback, such as bugs, questions, comments, etc. can be reported as _Issues_ in this repository, and will be handled by the Doist team.

## Contributions

We welcome contributions in the form of _Pull requests_ in this repository.
