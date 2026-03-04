# Time Simulation Controller for Preview

**Status**: Draft — Adversarial Review completed, implementation not started
**Date**: 2026-02-25

## Context

Testing time-dependent scenarios (ticket expiration, hold release, promotion delivery) in preview prototypes requires the ability to freely manipulate time. Beyond simple date changes, this requires second-level control and time-flow simulation (playback speed).

## Requirements

- Display current simulation time: `2026-02-25 14:30:25 (Asia/Seoul, UTC+9)`
- Edit date/hour/minute/second individually
- Play: start time flow (default 1x)
- FastForward: 1x → 10x → 60x (1sec=1hour) → 1440x (1sec=1day)
- Rewind: reverse direction with same speed options
- Stop: freeze time
- Reset: return to real current time + reset speed

## Design

### Time Engine (`preview-template/src/mocks/time-engine.ts`)

Core simulation module. All MSW handlers get time from this module.

```
State:
- baseReal: number     — real time (ms) when simulation anchor was set
- baseVirtual: number  — virtual time (ms) at simulation anchor
- speed: number        — playback speed (1, 10, 60, 1440, -1, -10, -60, -1440, 0=stop)

Virtual time calculation:
  virtualNow = baseVirtual + (Date.now() - baseReal) * speed

API:
- getNow(): Date           — virtual current time (Date object)
- getToday(): string       — virtual today (YYYY-MM-DD)
- getTimestamp(): string   — virtual ISO timestamp (for business events)
- setSpeed(n)              — set playback speed (0=stop)
- play()                   — if speed=0, set to 1 and start
- stop()                   — freeze time (fix current virtual time, speed=0)
- reset()                  — return to real time, speed=0
- setVirtualTime(date)     — set virtual time directly (auto stop)
- getSpeed()               — current speed
- getTimezone()            — browser timezone string
- subscribe(cb): () => void — state change callback (returns unsubscribe function)
```

### Date Utils (`preview-template/src/mocks/date-utils.ts`)

Pure date arithmetic functions. Separated from time simulation.

```
- toLocalDateStr(date: Date): string
- addDays(dateStr: string, days: number): string
- diffDays(a: string, b: string): number
```

### Time Controller UI (`preview-template/src/components/DevPanel.tsx`)

```
┌─────────────────────────────────────────┐
│ 🕐 2026-02-25 14:30:25                  │
│    Asia/Seoul (UTC+9)         [1440x▶]  │
│                                         │
│  [⏪] [◀] [⏸] [▶] [⏩]  [↺ Reset]     │
│  Rewind  1x  Stop Play  FF              │
│                                         │
│  [Reset State]  [Show Store]            │
└─────────────────────────────────────────┘
```

### deliverable-generator.md Rule Changes

- `import { getToday, getTimestamp } from './time-engine'`
- `import { addDays } from './date-utils'`
- Business event timestamps → `getTimestamp()`
- System event timestamps → `new Date().toISOString()` (unchanged)

## Files

| File | Action |
|------|--------|
| `preview-template/src/mocks/time-engine.ts` | CREATE |
| `preview-template/src/mocks/date-utils.ts` | CREATE |
| `preview-template/src/components/DevPanel.tsx` | MODIFY |
| `.claude/agents/deliverable-generator.md` | MODIFY |
| `specs/{feature}/preview/` | Apply same changes per feature |

---

## Adversarial Review (12 Findings + Recommendations)

### #1. `running` and `speed` redundancy

- **Issue**: `speed=0` means stop, but separate `running: boolean` also exists. Invariant not defined.
- **Resolution**: Remove `running`. Unify with `speed`. speed=0 is stop, speed≠0 is play.
- **Status**: ✅ Reflected in Design (running removed)

### #2. Rewind negative time risk

- **Issue**: At -1440x, time goes back 1 day per second. Minutes of rewind = months in past. Invalid state.
- **Resolution**: Set floor (current virtual time - 30 days). Auto stop at floor + UI indicator.
- **Status**: ⬜ Apply at implementation

### #3. localStorage restore time explosion

- **Issue**: Restoring `baseReal` after browser close causes `elapsed × speed` time jump.
- **Resolution**: Save `{ virtualTime, speed }` only. On restore: `baseReal = Date.now()`, `baseVirtual = savedVirtualTime`, restore in stopped state.
- **Status**: ⬜ Apply at implementation

### #4. `setVirtualTime()` during playback

- **Issue**: Behavior undefined when editing time during active playback.
- **Resolution**: Auto stop on direct edit (speed=0). User must click Play to resume.
- **Status**: ✅ Reflected in Design ("auto stop")

### #5. No state transitions without API calls

- **Issue**: MSW only calls `getToday()` on request. Moving time doesn't change ticket state on screen.
- **Resolution**: Add `recalculateStates()` — recalculate all ticket states vs virtual time on time change/play. During playback, recalculate every 1 second via setInterval.
- **Status**: ⬜ Apply at implementation

### #6. subscribe memory leak

- **Issue**: No unsubscribe mechanism.
- **Resolution**: `subscribe(cb)` returns unsubscribe function. Use in React `useEffect` cleanup.
- **Status**: ✅ Reflected in Design (`subscribe(cb): () => void`)

### #7. datetime-local timezone mismatch

- **Issue**: `<input type="datetime-local">` is local timezone. Display says "Asia/Seoul" but browser may differ.
- **Resolution**: Use `Intl.DateTimeFormat().resolvedOptions().timeZone` for dynamic display. No hardcoding.
- **Status**: ⬜ Apply at implementation

### #8. Speed cycling UX transition rules

- **Issue**: 5th FF click behavior undefined. FF↔Rewind transition undefined.
- **Resolution**: FF max 1440x (stays). Rewind max -1440x (stays). FF↔Rewind: sign inversion. From stop: start at 1x in that direction.
- **Status**: ⬜ Apply at implementation

### #9. `getTimestamp()` conversion scope

- **Issue**: Not all timestamps should use virtual time. `extracted_at` should be real time.
- **Resolution**: 2 types. Business events (activated_at, sent_at, called_at) → `getTimestamp()`. System events (extracted_at) → `new Date().toISOString()`.
- **Status**: ✅ Reflected in Design (business/system event distinction)

### #10. preview-template change compatibility

- **Issue**: DevPanel customization in existing projects may conflict on update.
- **Resolution**: Existing fingerprint mechanism already protects customized files. time-engine.ts/date-utils.ts are new files (no conflict). No additional action needed.
- **Status**: ✅ Existing mechanism sufficient

### #11. Verification items reinforcement

- **Issue**: Only UI display verified. No API-level verification.
- **Resolution**: Add "move time past expiry → GET /tickets/my → verify EXPIRED status" and similar API-level checks.
- **Status**: ⬜ Apply at implementation

### #12. `addDays` placement

- **Issue**: addDays in time-engine mixes concerns (time simulation + date arithmetic).
- **Resolution**: Separate into `date-utils.ts`. time-engine handles simulation only, date-utils handles pure date math.
- **Status**: ✅ Reflected in Design (date-utils.ts separated)
