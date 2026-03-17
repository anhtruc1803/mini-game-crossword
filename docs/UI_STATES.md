# UI States

## Public viewer

### Loading

- Route-level loading UI comes from `app/(public)/[programSlug]/loading.tsx`.
- The public page renders a loading shell while the initial snapshot is fetched.

### Not found

- If `programSlug` does not resolve to a program, the route returns `notFound()`.

### No game yet

- Program exists, but there is no game for it.
- Viewer shows program branding and a "starting soon" style empty state.

### Draft game

- Status badge shows draft/about-to-start state.
- Rows exist, but answers remain hidden.
- Final keyword is not shown.

### Live game

- Active row is highlighted.
- Hidden rows show blank cells.
- `clue_visible` rows show the clue text in the clue list, but not letters.
- `answer_revealed` rows show letters and highlighted keyword cells.
- Announcement and recent events are visible.

### Paused game

- Same visible board state as live.
- Status badge changes to paused.
- No special polling behavior changes on the client.

### Ended game

- Existing board state remains visible.
- Final keyword may be shown if present.
- Final keyword is only sent to the public viewer once the game is ended.

### Polling behavior

- Viewer state is initialized with SSR.
- Client polling refreshes the whole snapshot every `APP_CONFIG.pollingIntervalMs`.
- Polling pauses when the browser tab is hidden.

## Crossword row cell states

### hidden

- No letters are shown.
- Cells render as muted blanks.

### clue_visible

- Clue list shows the clue text.
- Board still does not show letters.

### answer_revealed

- Board shows letters.
- Highlighted indexes get accent styling.
- Clue list also shows the revealed answer text.

## Admin UI

### Login page

- Email + password form
- Inline error state on failed sign-in
- Redirects to programs list on success

### Protected admin routes

- `/admin/programs/*` requires a valid signed cookie and a database-backed admin account
- invalid sessions are redirected to `/admin/login`

### Programs list

- empty state if there are no programs
- card/list state when programs exist

### Program detail

- summary information for the selected program
- status controls
- navigation to game, rows, and theme sections

### Game control page

- start, pause, resume, end, reset controls
- row advancement controls
- announcement management
- event log display

### Rows page

- row creation form
- rows table/editor
- live games block row edits and deletes at the service layer

### Theme page

- theme creation or update form
- current UI mainly exposes name and core color controls
- theme image URLs exist in the data model, but not all upload flows are wired into the form yet
