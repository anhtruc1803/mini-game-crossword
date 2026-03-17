# UI States

## Viewer Page

### Loading state
- Skeleton loader for crossword board
- "Đang tải..." text

### Error state
- Error message + retry button

### Game not found
- "Chương trình không tồn tại" message

### Game draft (not started)
- Show program info + "Sắp diễn ra" badge
- Crossword board with all rows hidden (blank cells)

### Game live
- "Đang diễn ra" badge (green)
- Active row highlighted
- Revealed answers shown with characters
- Clue-visible rows show question marks or blank cells
- Hidden rows fully blank

### Game paused
- "Tạm dừng" badge (yellow)
- All current state preserved, no new reveals

### Game ended
- "Đã kết thúc" badge (gray)
- All revealed answers remain visible
- Final keyword displayed if fully revealed

### Crossword cell states
- **Hidden**: dark/blank cell
- **Clue visible**: empty cell with border (question opened but no answer yet)
- **Answer revealed**: cell with character shown
- **Highlighted**: revealed cell with accent color background

## Admin Pages

### Programs list
- Empty: "Chưa có chương trình nào" + create button
- With data: table/card list with status badges

### Game control panel
- Buttons enabled/disabled based on current game status
- Current row indicator
- Quick action buttons always visible

### Row editor
- Inline editing for clue/answer text
- Visual highlight picker for character indexes
- Status indicator per row
