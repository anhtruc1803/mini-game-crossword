# Domain Rules

## Core entities

### Program

Represents one event or show.

- owns the public slug
- may have a theme
- may have multiple games over time
- public viewer uses the latest game for the program

### Theme

Stores branding and color configuration.

### Game

Represents one crossword run for a program.

### CrosswordRow

Represents one clue, one answer, highlight indexes, and row status.

### GameEvent

Represents an audit/timeline event for admin and viewer.

## Program status rules

Allowed values:

- `draft`
- `live`
- `ended`

Allowed transitions:

- `draft -> live`
- `live -> ended`
- `ended -> draft`

Rules:

- slug must be unique
- `endAt` must be after `startAt` when both are set

## Game status rules

Allowed values:

- `draft`
- `live`
- `paused`
- `ended`

Allowed transitions:

- `draft -> live`
- `live -> paused`
- `live -> ended`
- `paused -> live`
- `paused -> ended`
- `ended -> draft`

Rules:

- game cannot start with zero rows
- starting sets `totalRows`
- starting sets `currentRowIndex` to `0`
- reset clears announcement and row progress

## Row status rules

Allowed values:

- `hidden`
- `clue_visible`
- `answer_revealed`

Allowed transitions:

- `hidden -> clue_visible`
- `clue_visible -> answer_revealed`
- `answer_revealed -> hidden`

Rules:

- clue reveal only when game is `live`
- answer reveal only when game is `live`
- no direct jump from `hidden` to `answer_revealed`

## Row editing rules

- rows cannot be created, updated, or deleted while game is `live`
- max rows is `APP_CONFIG.maxRows`
- row order is assigned sequentially
- deleting a row resequences remaining rows
- highlight indexes must fit inside answer length

## Announcement rules

- can be updated only while game is `live` or `paused`
- blank text is normalized to `null`

## Advance / rewind rules

### Advance

- only while game is `live`
- increments `currentRowIndex`
- cannot advance past last row

### Rewind

- only while game is `live` or `paused`
- only allowed when the newly selected row is still unopened
- intended for accidental next-step correction

## Viewer rules

Public viewer snapshots must:

- never expose hidden answers
- never expose final keyword before game end
- show clue text when row is `clue_visible`
- show answer text only when row is `answer_revealed`
- include recent events and announcement

## Keyword hint rules

- final keyword hint is derived from revealed answers only
- full final keyword is shown only after game end

## Operator expectation

A late viewer should still see the current truth:

- current row
- currently revealed rows
- recent updates
- keyword progress
