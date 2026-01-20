# Go Alone Feature - Test Plan

## Overview
This document provides a comprehensive test plan for verifying the "Go Alone" feature in the Euchre game.

## What Should Happen

### During Bidding
1. After ordering up or picking a suit, the maker sees a "Go Alone?" dialog
2. Dialog shows the trump suit and explains the rules
3. Two options: "Go Alone" or "Play with Partner"

### During Play (When Going Alone)
1. **Only 3 cards per trick** instead of 4 (partner sits out)
2. **Turn order skips the partner** automatically
3. Trump notice shows "Going Alone!" message
4. Partner's position doesn't play any cards

### Scoring (When Going Alone)
- **Alone March**: Win all 5 tricks → **4 points**
- **Win 3-4 tricks**: → **1 point**
- **Euchred (lose)**: Defending team wins 3+ tricks → **2 points to defenders**

## Manual Test Cases

### Test 1: Basic Go Alone Flow
**Steps:**
1. Start a new game
2. Play until you (human player) can order up or pick a suit
3. Select to call trump
4. Verify "Go Alone?" dialog appears
5. Click "Go Alone"
6. Verify trump notice shows "Going Alone!"
7. Click "Start Playing"

**Expected Results:**
- Dialog appears after calling trump
- Trump notice shows "Going Alone!" text
- Game advances to playing phase

### Test 2: Partner Sits Out (3 Cards Per Trick)
**Steps:**
1. Go alone as the human player (position 0)
2. Watch the trick play out
3. Count the number of cards played in each trick

**Expected Results:**
- Only 3 cards appear in the play area per trick
- Position 2 (your partner, North) never plays a card
- Turn order goes: 0 → 1 → 3 → (skip 2) → 0...

**How to Verify:**
- Open browser console (F12)
- Look for cards played messages
- Each trick should show exactly 3 cards

### Test 3: Alone March Scoring (4 Points)
**Steps:**
1. Go alone
2. Try to win all 5 tricks (may need to restart multiple times to get good cards)
3. Watch the score update after hand completes

**Expected Results:**
- If you win all 5 tricks going alone: +4 points to your team
- Score should jump by 4 (e.g., 0 → 4, or 5 → 9)

**Tip:** To test this reliably, you may need good trump cards. Keep restarting until you get a strong hand.

### Test 4: Partial Win Scoring (1 Point)
**Steps:**
1. Go alone
2. Win 3 or 4 tricks (but not all 5)
3. Watch the score update

**Expected Results:**
- +1 point to your team
- Same as not going alone for 3-4 tricks

### Test 5: Euchre When Going Alone (2 Points to Defenders)
**Steps:**
1. Go alone with a weak hand
2. Let the defending team win 3+ tricks
3. Watch the score update

**Expected Results:**
- +2 points to the defending team (West & East)
- Your team gets 0 points

### Test 6: Decline Go Alone
**Steps:**
1. Call trump
2. When "Go Alone?" dialog appears, click "Play with Partner"
3. Verify normal 4-player game continues

**Expected Results:**
- All 4 players play cards
- 4 cards per trick
- Normal scoring applies

### Test 7: AI Goes Alone
**Steps:**
1. Play several hands
2. Wait for an AI player to call trump
3. Watch if they ever go alone (they should if they have 4+ trump including a bower)

**Expected Results:**
- Trump notice shows "Going Alone!" when AI goes alone
- AI's partner sits out
- Only 3 cards per trick
- Scoring applies correctly

### Test 8: Partner Skip Logic (Edge Cases)

#### Case A: Partner is supposed to lead
**Setup:** Go alone when your partner would lead the first trick
**Expected:** First trick skips directly to you or next player

#### Case B: Partner wins a trick
**Setup:** This shouldn't happen (partner doesn't play)
**Expected:** N/A - partner never plays

#### Case C: Lead player going alone
**Setup:** Go alone when you're the lead player
**Expected:** You lead first, opponents play, your partner is skipped

## Known Issues & Fixes Applied

### Fixed Issues:
1. ✅ Go alone button not responding - Fixed by directly setting flags instead of calling processGoAlone
2. ✅ currentPlayer not set when PLAYING phase starts - Fixed by setting currentPlayer and checking for partner skip
3. ✅ Partner skip logic only in playCard - Also needed in phase advancement

### Current Status:
- All core functionality implemented
- Scoring verified in code review
- Partner skip logic implemented in:
  - playCard (lines 307-313)
  - advancePhase TRUMP_SELECTED → PLAYING (new fix)

## How to Run Tests

### Browser Console Tests
Open browser console (F12) and run:

```javascript
// Check if going alone
console.log('Going alone:', window.gameStore?.getState().game?.hand?.goingAlone);
console.log('Alone player:', window.gameStore?.getState().game?.hand?.alonePlayer);
console.log('Current trick cards:', window.gameStore?.getState().game?.hand?.currentTrick?.cardsPlayed.length);
```

### Visual Verification Checklist
- [ ] "Go Alone?" dialog appears
- [ ] Trump notice shows "Going Alone!"
- [ ] Only 3 cards appear in trick area
- [ ] Partner position never plays
- [ ] Scoring is correct (4 for march, 1 for 3-4, 2 for euchre)
- [ ] Decline button works correctly
- [ ] AI can go alone

## Automated Testing (Future)
To add automated tests:
1. Install vitest: `npm install -D vitest @vitest/ui @types/jest`
2. Add test script to package.json: `"test": "vitest"`
3. Create test file at `src/engine/__tests__/goAlone.test.ts` to verify scoring:
   - 4 points for alone march
   - 1 point for 3-4 tricks going alone
   - 2 points for euchre when going alone
4. Add E2E tests with Playwright for UI flow

## Notes
- Unit tests for scoring logic would verify the math is correct
- Manual testing required for UI/UX and turn order (see test cases above)
- Console logs added to gameStore.ts for debugging go alone flow
- Consider adding E2E tests with Playwright later
