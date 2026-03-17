# Domain Rules

## Entities

### Program
A program represents an event/show. It has a slug for the public URL, a theme for visual customization, and one or more games.

### Theme
Visual configuration for a program: logo, banner, backgrounds (separate for desktop/mobile), brand colors, fonts, overlay opacity.

### Game
A crossword game within a program. Contains multiple rows of questions/answers. Has a status controlling the live flow.

### CrosswordRow
A single question/answer in the crossword. Each row has highlighted character indexes that contribute to the final keyword.

### GameEvent
An audit log entry for game state changes (clue opened, answer revealed, etc.).

## Game Status

Valid values: `draft` | `live` | `paused` | `ended`

### Transitions

```
draft → live        (start game)
live → paused       (pause game)
live → ended        (end game)
paused → live       (resume game)
paused → ended      (end while paused)
ended → draft       (reset game — resets all rows too)
```

No other transitions are allowed.

## Row Status

Valid values: `hidden` | `clue_visible` | `answer_revealed`

### Transitions

```
hidden → clue_visible         (open question)
clue_visible → answer_revealed (reveal answer)
answer_revealed → hidden       (reset — only during game reset)
```

### Rules

1. A row can only become `clue_visible` if it is the current active row (`game.current_row_index`).
2. A row can only become `answer_revealed` if it is currently `clue_visible`.
3. Rows CANNOT skip from `hidden` directly to `answer_revealed`.
4. When admin clicks "next row", `current_row_index` advances by 1.

## Reset Game Rules

When a game is reset:
1. `game_status` → `draft`
2. `current_row_index` → `null`
3. `announcement_text` → `null`
4. ALL rows → `hidden`
5. A `game_reset` event is logged

## End Game Rules

When a game ends:
1. `game_status` → `ended`
2. All rows remain in their current state (no auto-reveal)
3. `current_row_index` is preserved for reference
4. A `game_ended` event is logged

## Late Viewer Rule

When a viewer opens the page at any point during or after the game:
- They receive a **full snapshot** of the current state
- All revealed answers are visible
- All opened clues are visible
- The current active row is highlighted
- Recent events are listed
- This ensures latecomers see the same state as everyone else
