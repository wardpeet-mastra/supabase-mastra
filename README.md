# Mastra Supabase Integration

A test project demonstrating the integration of Supabase edge functions as a backend with a client application using \@mastra/playground-ui components to visualize Mastra workflows.

## Project Overview

This project showcases:

- Supabase Edge Functions (Deno) as a serverless backend
- React + Vite frontend with Tailwind CSS
- Integration with Mastra workflow visualization components
- Type-safe client-server communication

## Backend (Supabase Edge Functions)

The backend is built using Supabase Edge Functions running on Deno. It provides the following API endpoints for workflow management:

| Endpoint                    | Method | Description                          |
| --------------------------- | ------ | ------------------------------------ |
| `/workflows/:id`            | GET    | Retrieve workflow information        |
| `/workflows/:id/runs`       | GET    | List all created runs for a workflow |
| `/workflows/:id/create-run` | POST   | Create a new workflow run            |
| `/workflows/:id/start`      | POST   | Start execution of a workflow run    |
| `/workflows/:id/watch`      | GET    | Monitor progress of the current run  |

### Running the Backend Locally

1. Start Supabase services:

```bash
pnpm dlx supabase start
```

2. Serve the edge functions:

```bash
pnpm dlx supabase functions serve api
```

## Frontend

The frontend is a Vite-based React application that uses:

- Tailwind CSS for styling
- \@mastra/playground-ui components for workflow visualization
- \@mastra/client-js for type-safe API communication

### Running the Frontend

```bash
pnpm dev
```

### UI Customization

If you're not using Tailwind CSS, you can:

- Mimic the classnames to maintain consistency
- Build your own UI components that implement the same interface
- Reference the [playground-ui source](https://github.com/mastra-ai/mastra/tree/main/packages/playground-ui) for implementation details

## Development

### Prerequisites

- Node.js (v20 or higher)
- pnpm
- Supabase CLI

### Setup

1. Install dependencies:

```bash
pnpm install
```

2. Set up environment variables:

```bash
cp .env.example .env
```

Copy your envs from running `pnpm dlx supabase start`

3. Start the development environment:

```bash
# Terminal 1 - Backend
pnpm dlx supabase functions serve api

# Terminal 2 - Frontend
pnpm dev
```
