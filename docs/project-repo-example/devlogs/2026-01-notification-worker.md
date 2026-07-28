---
title: Getting reminders right without being annoying
date: 2026-01-20
tags: [android, workmanager, ux]
---

The core problem with hydration reminders is that a naive fixed-interval
notification either nags too much or gets ignored entirely. Kap needed
something that respects how someone actually drinks water across a day.

The `project:` field gets stamped in automatically by the federation script,
so you never write it here — you just write.

## What shipped this week

- NotificationWorker now backs off after a logged intake, not just on a timer
- Light/dark ColorScheme split finalized
- Adaptive icon assets generated at 108x108dp
