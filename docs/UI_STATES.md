# UI States

## Public viewer

### Loading

- route loading uses `app/(public)/[programSlug]/loading.tsx`

### Not found

- invalid slug returns `notFound()`

### No game yet

- hero still renders
- stage shows starting-soon empty state

### Draft

- status badge shows upcoming state
- answers remain hidden
- final keyword stays hidden

### Live

- status badge pulses lightly
- balloons, sparkles, and confetti may appear
- question slider and board stay interactive
- clicking a question card highlights the matching row

### Paused

- board stays visible
- status changes to paused

### Ended

- final keyword may appear
- viewer keeps last known board state

## Viewer layout

### Hero

- program image
- title
- description
- iNET logo
- language switch
- dark/light switch

### Stage panel

- live status
- current question
- question count
- update count
- board label
- question slider
- crossword board
- keyword hint

### Updates panel

- announcement card
- timeline of recent events

## Theme states

### Dark mode

- default
- deep navy glass
- higher contrast for stream display

### Light mode

- brighter blue glass treatment
- stronger visual difference from dark mode
- still keeps Birthday Glass styling

## Admin UI

### Login

- email/password form
- inline errors

### Programs list

- empty state if no program exists
- glass cards when programs exist

### Program detail

- summary hero
- image preview
- actions and tabs

### Game control

- live controls
- rewind support
- event history

### Rows page

- row form
- row list
- edit lock while game is live

### Theme page

- theme management form

## Motion notes

- hover is soft, not aggressive
- live badge pulse is subtle
- cursor aura is light
- confetti is periodic, not constant
