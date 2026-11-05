# Task Manager

Basic Task Manager for the Vistula Team Project – IT course.

**Student ID:** 73194  
**Course GitHub account:** `vistula-team-project-73194`  
**Required repository:** [vistula-task-manager](https://github.com/Vitalii73194/vistula-task-manager)  
**Target application URL:** https://Vitalii73194.github.io/vistula-task-manager/

> The assignment requires the account name istula-team-project-73194. The supplied account is currently Vitalii73194; resolve this naming difference before submission.

## Status

Supabase is configured. Live REST checks passed for reading, creating, editing, completing, marking incomplete and deleting a temporary task. Source is pushed to GitHub and GitHub Pages is configured to publish from the root of main. Both partner Pull Requests are still pending.

## Features

- Load tasks from Supabase PostgreSQL through its REST API.
- Add and edit a title and optional description.
- Mark tasks complete or incomplete, and delete tasks.
- Persist changes in the database across page refreshes.
- Show request errors; keep entered text when saving fails.
- Responsive, keyboard-accessible interface. No framework, build step or login.

## Setup and deployment

Follow [SETUP.md](SETUP.md). Run `supabase-setup.sql` in a separate demonstration Supabase project, then fill in `config.json` with the project URL and **public publishable key**. Never commit a secret key, service-role key or database password.

Serve locally with `python -m http.server 8000 --bind 127.0.0.1` and open http://127.0.0.1:8000/. Opening `index.html` as a local file will not support fetching configuration.

GitHub Pages must publish the root of the `main` branch.

## REST operations

Requests use `<supabaseUrl>/rest/v1/tasks` with the publishable key in the `apikey` header.

| Method | Query | Action |
| --- | --- | --- |
| GET | `?select=*&order=id.desc` | List tasks |
| GET | `?id=eq.1&select=*` | Fetch one task (API supported) |
| POST | — | Create task |
| PATCH | `?id=eq.1` | Update title, description or status |
| DELETE | `?id=eq.1` | Delete task |

## Team collaboration

The repository owner must not create their own `contribution.html` or `contribution.json`. These are intentionally absent until a different student adds them through a Pull Request. The main-page contribution link will work after that PR is merged.

- **Outgoing merged PR in partner's repository:** TODO — replace with actual merged PR URL.
- **Incoming merged PR from partner:** TODO — replace with actual merged PR URL.

The incoming JSON must contain the partner's student ID. The outgoing JSON must contain `73194`. Both receiving repository owners must review and merge their incoming PR.

See [COLLABORATION.md](COLLABORATION.md) for the exact contribution requirements.

## Manual acceptance check

Automated REST-stub checks: `node --test app.test.cjs`. These cover CRUD, refresh, error recovery, configuration validation and blank titles; real database and deployed-page checks remain required.

Live demonstration database check: `node scripts/check-supabase.cjs`. This creates one temporary task, checks CRUD and persistence through a separate read, and deletes only that task afterward. Last successful run: 5 November 2026. Browser checks on the deployed GitHub Pages application passed on 5 November 2026: create, refresh persistence, edit, complete, refresh completion persistence, mark incomplete, delete and refresh removal. The temporary verification task was removed.

1. Open the deployed page and verify student ID `73194` and tasks loaded from Supabase.
2. Add a task with title and description. Refresh; verify it persists.
3. Edit both fields. Refresh; verify the saved values.
4. Complete the task, refresh, then mark it incomplete.
5. Delete it, refresh and verify it remains absent.
6. With the browser offline, attempt an operation; verify a useful error and retained form text. Reconnect and refresh.
7. After merging the partner PR, open the contribution link, click Show Contributor and verify the partner's ID is loaded from JSON.
8. Verify both PRs are merged and replace the README placeholders with their URLs.

Submit only the deployed main application URL in Platon.
