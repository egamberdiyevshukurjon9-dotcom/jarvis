---
name: morning-briefing
description: Morning briefing from calendar, mail and sales — tomorrow's meetings, clashes, the 3 most important unread emails, who is waiting for a reply, and revenue. Use for "good morning", "what do I have tomorrow", "brief me", "ertaga menda nima bor".
---

# Morning briefing

Give the user one short briefing built from their calendar, inbox and (if connected)
sales. Answer in the language the user wrote in.

## Sources
- **Calendar:** a Google Calendar / Outlook connector if one is available. Otherwise,
  if a browser tool is available (Claude in Chrome), open calendar.google.com.
- **Mail:** a Gmail / Outlook connector, otherwise mail.google.com in the browser.
- **Revenue (optional):** a Stripe / payments connector or the shop's dashboard.
- If none of these can be reached, say which connector is missing and how to add it
  (claude.ai → Settings → Connectors), then stop.

## Steps
1. **Calendar.** Read the day asked about (today in the morning, tomorrow in the
   evening). For each event: time, title, place (Meet, Teams, Zoom, room).
   - A **clash** is two events whose times overlap. Name the later one and what it
     overlaps.
   - An invitation the user has not accepted or declined counts as **unanswered**.
2. **Inbox.** Count unread. Rank by importance: a real person (client, colleague,
   someone the user has written to before) over newsletters and notifications;
   anything with a deadline, money or a direct question; then age. Pick the top 3.
3. **Waiting for a reply.** Threads where the last message is from someone else,
   addressed to the user, asks something, and is older than 2 days. Say who and how
   long ("Aziz — 3 days").
4. **Revenue.** If connected: yesterday's total, number of payments, change from the
   day before.

## Output
Start with 2–3 sentences: number of meetings and the first one, any clash, and the
one email or reply that cannot wait. Then a compact table of the day, then the top 3
emails, then the "no reply" list, then revenue.

## Never
Send, accept, decline, archive, delete or mark anything as read as part of a
briefing. If the user asks for one of those, confirm in one sentence first.
