# Website

Frontend build for the Web3.Storage website.

## Getting Started

### Prerequisites

If you don't have `nvm` installed to manage node versions, then it is highly suggested. See [the nvm github](https://github.com/creationix/nvm) for more details.

```
- node >=v16.0.3
```

### Install dependencies

```
npm i
```

### Setting up

Inside the `/packages/website` folder create a file called `.env.local` with the following content.

Verify that the following are set in the `.env` file in root of the project monorepo.

```ini
NEXT_PUBLIC_ENV=dev
NEXT_PUBLIC_API=http://127.0.0.1:8787
NEXT_PUBLIC_MAGIC=<magic test mode publishable key>
```

for local debugging API:

```ini
NEXT_PUBLIC_ENV=dev
NEXT_PUBLIC_API=http://localhost:4000/api
NEXT_PUBLIC_MAGIC=<magic test mode publishable key>
```

## Usage

### Running Locally


#### Development

```bash
cd packages/website
npm run dev
```

#### Production

```bash
cd packages/website
npm run build
npm run start
```

### Linting

```bash
cd packages/website
npm run lint
```

### Running Storybook

```bash
After `Running Locally`
npm run storybook
```

## Deploy

TBD

## Docs

Docs are written in markdown and uses Nextra.

Notes
- ensure that components (eg. `<Callout>... </Callout>`) are not indented
- import statements are allowed

Components used
- components/tabs
- components/feedback
- components/codesnippet
- components/accordionsingle
