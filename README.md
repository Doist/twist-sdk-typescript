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

### Batch Requests

The SDK supports making multiple API calls in a single HTTP request using the `/batch` endpoint. This can significantly improve performance when you need to fetch or update multiple resources.

**Note:** Batch requests are completely optional. If you only need to make a single API call, simply call the method normally without the `{ batch: true }` option.

#### How It Works

To use batch requests:

1. Pass `{ batch: true }` as the last parameter to any API method
2. This returns a `BatchRequestDescriptor` instead of executing the request immediately
3. Pass multiple descriptors to `api.batch()` to execute them together

```typescript
// Single requests (normal usage)
const user1 = await api.workspaceUsers.getUserById(123, 456)
const user2 = await api.workspaceUsers.getUserById(123, 789)

// Batch requests - executes in a single HTTP call
const results = await api.batch(
    api.workspaceUsers.getUserById(123, 456, { batch: true }),
    api.workspaceUsers.getUserById(123, 789, { batch: true })
)

console.log(results[0].data.name) // First user
console.log(results[1].data.name) // Second user
```

#### Response Structure

Each item in the batch response includes:

- `code` - HTTP status code for that specific request (e.g., 200, 404)
- `headers` - Response headers as a key-value object
- `data` - The parsed and validated response data

```typescript
const results = await api.batch(
    api.channels.getChannel(123, { batch: true }),
    api.channels.getChannel(456, { batch: true })
)

results.forEach((result) => {
    if (result.code === 200) {
        console.log('Success:', result.data.name)
    } else {
        console.error('Error:', result.code)
    }
})
```

#### Performance Optimization

When all requests in a batch are GET requests, they are executed in parallel on the server for optimal performance. Mixed GET and POST requests are executed sequentially.

```typescript
// These GET requests execute in parallel
const results = await api.batch(
    api.workspaceUsers.getUserById(123, 456, { batch: true }),
    api.channels.getChannel(789, { batch: true }),
    api.threads.getThread(101112, { batch: true })
)
```

#### Mixing Different API Calls

You can batch requests across different resource types:

```typescript
const results = await api.batch(
    api.workspaceUsers.getUserById(123, 456, { batch: true }),
    api.channels.getChannels({ workspaceId: 123 }, { batch: true }),
    api.conversations.getConversations({ workspaceId: 123 }, { batch: true })
)

const [user, channels, conversations] = results
// TypeScript maintains proper types for each result
console.log(user.data.name)
console.log(channels.data.length)
console.log(conversations.data.length)
```

#### Error Handling

Individual requests in a batch can fail independently. Always check the status code of each result:

```typescript
const results = await api.batch(
    api.channels.getChannel(123, { batch: true }),
    api.channels.getChannel(999999, { batch: true }) // Non-existent channel
)

results.forEach((result, index) => {
    if (result.code >= 200 && result.code < 300) {
        console.log(`Request ${index} succeeded:`, result.data)
    } else {
        console.error(`Request ${index} failed with status ${result.code}`)
    }
})
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

A new version is published to the NPM Registry whenever a new release on GitHub is created. The workflow automatically detects prerelease versions (alpha, beta, rc) and publishes them with the appropriate tag.

To prepare a new release:

```bash
# For alpha releases
npm version prerelease --preid=alpha --no-git-tag-version

# For stable releases
npm version <major|minor|patch> --no-git-tag-version
```

Once the version in `package.json` is updated, push the changes and create a GitHub release. The workflow will automatically publish to npm with the correct tag.

## Feedback

Any feedback, such as bugs, questions, comments, etc. can be reported as _Issues_ in this repository, and will be handled by the Doist team.

## Contributions

We welcome contributions in the form of _Pull requests_ in this repository.
