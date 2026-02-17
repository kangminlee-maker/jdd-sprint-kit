---
stepsCompleted: [1, 2, 3, 4, 5, 6]
inputDocuments:
  - specs/test-tutor-excl/inputs/sprint-input.md
  - specs/test-tutor-excl/inputs/brief.md
  - specs/test-tutor-excl/inputs/260115-sync-meeting.md
  - specs/test-tutor-excl/inputs/260123-kickoff-meeting.md
  - specs/test-tutor-excl/inputs/260123-kickoff-summary.md
  - specs/test-tutor-excl/inputs/260123-kickoff-transcript.md
  - specs/test-tutor-excl/planning-artifacts/brownfield-context.md
date: 2026-02-17
author: Auto Sprint (Mary — Business Analyst)
---

# Product Brief: Tutor Exclusion (test-tutor-excl)

## Executive Summary

EduTalk is a 1:1 online English/Japanese conversation tutoring platform using random tutor matching. Students cannot currently prevent rematching with tutors they had negative experiences with, leading to class cancellations, schedule changes, and eventual churn. The CX team manually handles 15-20 matching exclusion requests monthly, and tutor-related complaints cost approximately 3M KRW/month in refunds.

This initiative introduces a **Post-Lesson Rating + Tutor Block + Block Management** system that enables students to self-service exclude unwanted tutors from their matching pool while simultaneously improving lesson feedback data collection from the current 6% to a target of 20%+.

---

## Core Vision

### Problem Statement

In EduTalk's random matching model, students who have had negative experiences with certain tutors have no mechanism to prevent rematching. This creates a recurring negative loop: bad experience → rematching → class cancellation or schedule change → satisfaction decline → service churn.

### Problem Impact

- **Student impact**: 56% of surveyed students (N=500) report encountering unwanted tutors; only 12% contact CS about it
- **Operational cost**: CX team manually processes 15-20 matching exclusions per month
- **Financial cost**: Tutor-related complaints generate ~3M KRW/month in refunds
- **CS volume**: ~100 tutor-related CS cases in 3 months, 18% specifically requesting "never match again"
- **Data gap**: Current lesson rating response rate is only 6%, making tutor quality monitoring nearly impossible

### Why Existing Solutions Fall Short

- **Current NPS system**: Push-based (25% probability post-lesson), resulting in only 23% NPS response rate and 6% actual star rating rate — insufficient for quality monitoring
- **Manual CX exclusion**: Reactive, not scalable, creates dependency on CX team, and students who don't contact CS continue suffering in silence (88% of affected students)
- **No in-app mechanism**: Students must leave the product flow to contact CS, creating friction and delay

### Proposed Solution

A three-component system integrated into the existing student lesson flow:

1. **Post-Lesson Rating Popup**: Shown when students enter the reservation tab after completing a lesson. Captures star rating (1-5) + categorized reasons (positive/negative). Bridges to block suggestion on negative ratings (1-2 stars). Non-intrusive: once daily, most recent lesson only, with skip option.

2. **Tutor Block**: Three entry points — rating popup (negative), lesson history detail page, and block management page. Immediate exclusion from matching pool for future reservations (existing bookings unaffected). Limit: 5 tutors per language.

3. **Block Management Page**: New React SPA page under MyPage > Lesson Settings > Tutor Management. View blocked tutors, unblock with confirmation, see inactive tutor status. Linked from legacy MyPage (Vue.js 2) via URL parameter token passing.

### Key Differentiators

- **Integrated flow**: Rating and blocking are connected — negative rating naturally leads to block suggestion, increasing both feedback collection and self-service blocking
- **Triple purpose**: Student satisfaction improvement + operational automation + tutor quality monitoring in a single feature
- **Non-intrusive design**: Skip option, once-daily limit, and progressive disclosure (star → reasons → block suggestion) prevent rating fatigue

---

## Target Users

### Primary Users

**Active Students (수강생)**
- Students with active subscriptions who take regular lessons (daily or multiple times per week)
- Core pain: Encountering previously negative-experience tutors in random matching
- Motivation: Consistent, enjoyable learning experience without dreading who they'll be matched with
- Current workaround: Cancelling lessons, changing time slots, or contacting CS for manual exclusion
- Success moment: Blocking an unwanted tutor and never being matched with them again

### Secondary Users

**CX Operations Team**
- Currently handling 15-20 manual matching exclusion requests per month
- Benefit: Reduced manual workload as students self-service their exclusions
- Retained capability: Admin dashboard access to block statistics for tutor quality monitoring

**Tutor Quality Management**
- Product/operations staff monitoring tutor performance
- Benefit: Aggregated rating and block data provides quantitative insights into tutor quality
- Note: Tutors are NOT notified of blocks in this sprint (decision deferred)

### User Journey

**Primary Journey: Post-Lesson → Rating → Block**
1. Student completes a lesson on ClassBoard
2. Student returns to reservation tab on EduTalk main app
3. Rating popup appears for the most recent unrated lesson
4. Student rates (1-2 stars) → selects negative reasons → sees "Don't match with this tutor again" checkbox
5. Student checks the box and submits → confirmation popup → block applied
6. Future reservations automatically exclude this tutor from the matching pool

**Alternative Journey: Retrospective Block from Lesson History**
1. Student recalls a past negative experience
2. Navigates to reservation > past lessons > lesson detail
3. Taps "Block this tutor" on the lesson detail page
4. Confirmation popup → block applied

**Management Journey: Block List Management**
1. Student reaches block limit (5 per language)
2. Attempts to block new tutor → receives limit notification with link to management page
3. Navigates to MyPage > Lesson Settings > Tutor Management
4. Reviews blocked list → unblocks one tutor → blocks the new tutor

---

## Success Metrics

### User Success Metrics

| Metric | Current | Target | Measurement |
|--------|---------|--------|-------------|
| Post-lesson rating response rate | 6% | 20%+ | Ratings submitted / lessons completed |
| Block feature adoption | N/A | 15%+ of students with negative experiences | Students who block / students who rate 1-2 stars |
| CX tutor exclusion requests | 15-20/month | <5/month | CS ticket category tracking |
| Tutor-related refunds | ~3M KRW/month | 50% reduction | Payment system refund tracking |

### Business Objectives

- **Reduce churn**: Prevent satisfaction-driven churn by eliminating forced rematching with disliked tutors
- **Operational efficiency**: Shift matching exclusion from CX manual process to student self-service
- **Data-driven quality**: Build foundation for tutor quality management through rating data aggregation
- **Revenue protection**: Reduce tutor-complaint-related refunds (~3M KRW/month potential savings)

### Key Performance Indicators

- Rating popup impression-to-completion rate (target: >50%)
- Rating popup skip rate (monitor: <60%)
- Average block count per student after 30 days
- Block-unblock cycling frequency (health indicator)
- Student retention rate change (cohort: students who blocked vs. control)

---

## MVP Scope

### Core Features

1. **Post-Lesson Rating System**
   - Rating popup on reservation tab entry (once daily, most recent lesson)
   - 1-5 star rating with categorized positive/negative reasons (multi-select)
   - Block suggestion checkbox on negative rating (1-2 stars)
   - Progressive save: "Next" saves star only, "Submit" saves star + reasons, skip/close saves nothing

2. **Tutor Block Mechanism**
   - Three entry points: rating popup, lesson history detail, block management page
   - Immediate matching pool exclusion on block
   - Per-language limit: 5 tutors (English 5 + Japanese 5 independently)
   - Limit exceeded flow: notification + redirect to management page
   - Existing reservations unaffected (new reservations only)

3. **Block Management Page**
   - React SPA linked from MyPage (Vue.js 2) via URL token parameter
   - Blocked tutor list with profile info, block date, last lesson date
   - Unblock with confirmation dialog + matching pool restoration
   - Inactive tutor label display (resigned/long-term leave), counted toward limit

### Out of Scope for MVP

- Tutor notification of being blocked
- Admin dashboard block statistics (DISC-02: confirmed as not in MVP scope)
- Push notification reminders for unrated lessons
- Tutor → student matching avoidance (reverse direction)
- Preferred tutor designation (future feature)
- Automatic release of inactive tutor blocks
- App push-based rating reminders

### MVP Success Criteria

- Rating response rate reaches 20%+ within 30 days of launch
- CX manual exclusion requests drop to <5/month within 60 days
- Block feature functions correctly across all three entry points
- No regression in existing lesson booking/completion flow
- MyPage → React SPA handoff works reliably with token authentication

### Future Vision

- **Phase 2**: Preferred tutor system (positive matching weight)
- **Phase 2**: Tutor → student matching avoidance
- **Phase 3**: Admin dashboard with block/rating analytics
- **Phase 3**: Push notification rating reminders (pending notification fatigue assessment)
- **Long-term**: Automated tutor quality scoring based on aggregated ratings and block patterns
- **Long-term**: Inactive tutor auto-release policy

---

## Technical Context (Brownfield)

### Integration Points

| System | Integration | Complexity |
|--------|------------|------------|
| Matching Engine (`/schedules/match`) | Add block list filter to tutor pool query | MEDIUM — core business logic change |
| Lesson Feedback (`/lessons/{id}/feedback`) | Extend existing endpoint or create new rating endpoint | LOW — additive change |
| MyPage (Vue.js 2 → React SPA) | URL parameter token handoff for authentication | LOW — established pattern per 260115-sync-meeting |
| Reservation Tab UI | Add rating popup trigger on tab entry | LOW — additive UI component |
| Lesson Detail Page | Add "Block Tutor" button | LOW — additive UI element |

### New Components Required

| Component | Description |
|-----------|------------|
| `tutor_blocks` table | New DB table for student-tutor block records |
| Block API endpoints | CRUD for blocks + limit check |
| Rating Popup Component | Multi-step modal with star rating + reasons |
| Block Management Page | React SPA with list, unblock, inactive display |
| BFF endpoints | Hono routes for block/rating aggregation |

### Constraints

- ClassBoard is on a separate domain — session sharing not possible (confirmed in 260115-sync-meeting)
- Rating popup must trigger from EduTalk main app (reservation tab), not ClassBoard
- MyPage menu is Vue.js 2 legacy — new page is React SPA linked via URL
- Block data must be preserved after unblock (for admin analytics)
- Block unit is user ID based (device/session independent)
