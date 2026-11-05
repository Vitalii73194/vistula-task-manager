# Task Manager

Task Manager for the Vistula Team Project – IT course.

**Student ID:** 73194
**Current GitHub account:** Vitalii73194
**Repository:** https://github.com/Vitalii73194/vistula-task-manager
**Application:** https://vitalii73194.github.io/vistula-task-manager/

The assignment requires the account name `vistula-team-project-73194`. The current account name differs; resolve this before submission.

## Features

- Display, create, edit and delete tasks.
- Mark tasks complete or incomplete.
- Store titles, descriptions and completion status in Supabase PostgreSQL.
- Preserve changes after page refresh and display useful request errors.
- Responsive HTML/CSS/JavaScript interface without installation or login.

## Configuration and hosting

`config.json` contains the Supabase project URL, public publishable key and table name `tasks`. The application uses the Supabase REST API with GET, POST, PATCH and DELETE requests. The demonstration table has public CRUD policies with Row Level Security enabled. Use test data only. Never publish secret keys, service-role keys or database passwords.

GitHub Pages publishes the root of the `main` branch. No build step is required.

To serve locally, run `python -m http.server 8000 --bind 127.0.0.1` and open http://127.0.0.1:8000/.

## Team collaboration

Both partner Pull Requests are still pending. Another student must add `contribution.html` and `contribution.json` through a Pull Request; the contribution link will work after that PR is merged.

- **Outgoing merged PR in partner's repository:** TODO — add merged PR URL.
- **Incoming merged PR from partner:** TODO — add merged PR URL.

The outgoing contribution JSON must contain student ID `73194`. The incoming JSON must contain the partner's student ID. Each repository owner must review and merge their incoming PR.

## Verification

Live Supabase API checks and browser checks on GitHub Pages passed on 5 November 2026: creation, editing, completion, marking incomplete, deletion and persistence after refresh. Temporary verification tasks were removed.

After both PRs are merged, verify that the contribution page loads the partner's ID from JSON and add both PR links above. Submit only the main application URL in Platon.
