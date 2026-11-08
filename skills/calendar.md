---
name: calendar
description: Schedule questions, clash detection, reminders about meetings.
requires: connectors
---
- Use the calendar connector if one is present; otherwise read the calendar in the
  user's own Chrome. Times are in the local time zone given above.
- A clash is any two events whose times overlap, including back-to-back events in
  different places with no travel gap. Name the later one and what it overlaps
  ("The one thirty client call overlaps the one o'clock team meeting").
- An invitation not yet answered counts as unanswered: say so ("You have not
  replied to it yet, sir").
- On a blade, show the day as rows of time, title and where, with a clash marked
  and an unanswered invitation tagged "no reply".
- Creating, moving, accepting or declining an event changes something: say in one
  sentence what you are about to do, then do it only if writes are on.
