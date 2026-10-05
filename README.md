# ToDo Assessment

A small full-stack todo list app: an Angular front end backed by an ASP.NET Core Web API that keeps
items in memory (no database).

## Projects

| Folder                                | What it is                                   |
| -------------------------------------- | --------------------------------------------- |
| `WebAPI/ToDoAssessment.WebAPI`         | ASP.NET Core 10 Web API (in-memory todo store) |
| `WebAPI/ToDoAssessment.WebAPI.Tests`   | xUnit tests (unit + integration)              |
| `UI`                                   | Angular 22 single-page app                    |

## Running the app

You'll need two terminals: one for the API, one for the Angular dev server.

### 1. API

```bash
cd WebAPI/ToDoAssessment.WebAPI
dotnet restore
dotnet run
```

By default this listens on `http://localhost:5092` (see `Properties/launchSettings.json`). With the
`Development` environment active, Scalar's API docs are available at `/scalar/v1`.

### 2. Angular UI

```bash
cd UI
npm install
npm start
```

This runs `ng serve --proxy-config proxy.conf.json`, so requests the UI makes to `/api/*` are
forwarded to `http://localhost:5092` automatically — no CORS setup is required. Open
`http://localhost:4200` once it's done building.

> If you change the API's port, update `UI/proxy.conf.json` to match.

## Tests

```bash
# backend
dotnet test

# frontend
cd UI
npm test
```

## Notes on the implementation

- The API stores todos in a singleton, in-memory service guarded by a lock — data resets whenever the
  API restarts, which is fine for this assessment (no database required).
- The Angular app is a single feature (`src/app/features/todo-list`) that lists, adds and deletes
  items, talking to the API through a thin `TodoService` wrapping `HttpClient`.
- Both sides have tests: xUnit for the API (service logic + HTTP integration via
  `WebApplicationFactory`), and Vitest/Angular TestBed for the UI (service + component behaviour).
