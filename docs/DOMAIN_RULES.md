# Domain Rules

## Core entities

### Program

A program represents a show or event.
It owns the public slug and can optionally point to a theme.
A program can have multiple games over time, but admin pages work with the latest game for the selected program.

### Theme

Theme stores branding and visual options such as colors and image URLs.

### Game

A game is the live crossword state machine attached to a program.

### CrosswordRow

A row contains one clue, one answer, highlight indexes, and its own reveal state.

### GameEvent

A game event is an audit log message describing an important state change.

## Program status rules

Valid values:

```text
draft | live | ended
```

Allowed transitions:

```text
draft -> live
live -> ended
ended -> draft
```

Rules:

- live programs cannot be deleted
- program slug must be unique
- `endAt` must be after `startAt` when both are present

## Game status rules

Valid values:

```text
draft | live | paused | ended
```

Allowed transitions:

```text
draft -> live
live -> paused
live -> ended
paused -> live
paused -> ended
ended -> draft
```

Rules:

- a game cannot start unless it has at least one row
- starting a game sets `totalRows` and sets `currentRowIndex` to `0`
- ending a game does not auto-reveal remaining rows
- resetting a game returns it to `draft`

## Row status rules

Valid values:

```text
hidden | clue_visible | answer_revealed
```

Allowed transitions:

```text
hidden -> clue_visible
clue_visible -> answer_revealed
answer_revealed -> hidden
```

Rules:

- clue reveal is only valid while the game is `live`
- answer reveal is only valid while the game is `live`
- the current active row is selected by `game.currentRowIndex`
- rows do not skip directly from `hidden` to `answer_revealed`

## Row editing rules

- rows cannot be created, updated, or deleted while the game is `live`
- a game can contain at most `APP_CONFIG.maxRows`
- `rowOrder` is assigned sequentially on creation
- deleting a row resequences the remaining row order values
- highlighted indexes must be inside the answer length
- answers are normalized to uppercase by validation

## Announcement rules

- announcement text can only be updated while the game is `live` or `paused`
- blank announcement input is normalized to `null`

## Reset rules

When a game is reset:

1. game status becomes `draft`
2. `currentRowIndex` becomes `null`
3. `announcementText` becomes `null`
4. all rows return to `hidden`
5. a `game_reset` event is logged

## Advance rules

- advancing the row is only valid while the game is `live`
- advancing increases `currentRowIndex` by one
- advancing past the last row is not allowed

## Public viewer rules

The public viewer receives a sanitized snapshot.

- unrevealed answers are not sent to the client
- the final keyword is not sent until the game is ended
- revealed answers remain visible to late viewers
- clue-visible rows show the clue, but not the answer
- recent events are visible in the public snapshot

These are server-side guarantees, not just UI behavior.

## Late viewer rule

A viewer who joins mid-game should still see the current truth:

- current game status
- current row highlight
- revealed answers
- opened clues
- recent event log
- final keyword hint cells derived from revealed rows only
