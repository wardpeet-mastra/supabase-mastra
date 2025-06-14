## Supabase (deno) with ui

- UI lives in src
- edge function contain hono with workflow handlers

## how to run?

- start edge fn: `pnpm dlx supabase functions serve api`
- start client: `pnpm dev`

## What's not working?

Run creation is not working as we use a simple Map to store our data which in Deno seems to reset for each request, we need to lift it to a kv store of some sort
