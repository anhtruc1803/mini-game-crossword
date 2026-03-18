# Usage Guide

This guide explains how to use the current version of the app as an operator.

## 1. Sign in as admin

Open `/admin/login` and sign in with an admin account from `admin_users`.

If this is a fresh environment:

1. Set `SEED_ADMIN_EMAIL` and `SEED_ADMIN_PASSWORD`
2. Run `npm exec prisma db seed`
3. Sign in with the seeded account

## 2. Create a program

Go to `/admin/programs/new`.

Fill in:

- title
- slug
- optional description
- optional program image

The program image is used in both admin and the public viewer hero.

## 3. Create a game

Open a program and create a game if one does not exist yet.

Fields:

- title
- optional subtitle
- optional final keyword

The public viewer always uses the latest game for the selected program.

## 4. Add crossword rows

Go to the rows page for the program.

For each row:

- enter clue text
- enter answer text
- choose highlighted indexes
- optionally add admin note text

Important:

- answers are normalized through validation
- highlighted indexes must stay inside answer length
- rows cannot be edited while the game is live

## 5. Run the game

Open the game control page.

Available controls:

- Start game
- Open question
- Show answer
- Next question
- Previous question
- Pause
- Resume
- End game
- Reset game
- Update announcement

`Previous question` is only allowed when the newly selected next row is still unopened.

## 6. Watch the public viewer

Open `/{programSlug}` in another browser tab or another device.

Viewer behavior:

- receives a sanitized snapshot
- polls every 10 seconds
- highlights the current active row
- allows clicking question cards to focus a row locally
- supports dark / light mode
- shows soft birthday effects and confetti for live celebratory presentations

## 7. Understand the viewer panels

### Hero

- program title
- description
- image
- iNET branding
- language switch
- theme switch

### Main stage

- live status
- current question
- question count
- update count
- question slider
- crossword board
- final keyword hint

### Updates panel

- announcement card
- recent game events
- relative time labels

## 8. Theme switch

Dark / light mode is available on viewer and admin.

- preference is stored in `localStorage`
- dark is the default
- light mode uses a brighter glass treatment

## 9. Images and uploads

Supported image types:

- PNG
- JPEG
- WebP

Upload limit:

- 5 MB per file

Uploaded files are stored locally and served through `/media/...`.

## 10. Health checks

Use `/api/health` to confirm the app can reach the database.

Healthy response:

```json
{
  "status": "ok",
  "checks": {
    "env": true,
    "database": true
  }
}
```

## 11. Common operator notes

- Hidden answers are never exposed in the public payload
- Final keyword is only sent after game end
- Announcements only update while the game is live or paused
- Rate limiting is active for admin actions and login

## 12. Recommended operator workflow

1. Create program
2. Upload image
3. Create game
4. Add all rows
5. Open the viewer page in a second tab
6. Start the game from admin
7. Progress clue by clue during the livestream
8. End the game
9. Reset only when preparing for another run
