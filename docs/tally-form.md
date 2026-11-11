# The Tally submission form

The Submit page shows a Tally form, so people can send an event without a GitHub account.
Entries arrive in Tally (and, if you connect it, a Google Sheet or email). Add them to
`src/data/events.json`, or ask Claude to ("add the new Tally submissions").

## Make the form

1. Sign in at https://tally.so and create a blank form called **Submit an event to BuilderBee**.
2. Add these questions, in this order. Keep the wording short; the rest (time zone, region,
   coordinates, image) we fill in when we add the event.

| # | Question | Tally block | Required | Notes |
|---|---|---|---|---|
| 1 | Event name | Short answer | Yes | |
| 2 | Link to the event page or registration | Link | Yes | |
| 3 | Organiser | Short answer | Yes | |
| 4 | What kind of event is it? | Multiple choice | Yes | Hackathon, Buildathon, Workshop, Bootcamp, Meetup, Conference, Pitch night |
| 5 | Start date | Date | Yes | |
| 6 | End date | Date | No | Help text: "Leave empty if it's one day" |
| 7 | Where is it? | Multiple choice | Yes | Online, In person, Hybrid |
| 8 | City and country | Short answer | No | Help text: "Skip for online events" |
| 9 | Who is it for? | Long answer | Yes | Help text: "In the organiser's words, e.g. women and non-binary people in AI" |
| 10 | Is it free? | Multiple choice | Yes | Free, Paid |
| 11 | Experience level | Multiple choice | No | Beginner friendly, All levels, Advanced |
| 12 | Registration deadline | Date | No | |
| 13 | Prizes | Short answer | No | Help text: "e.g. $5,000 prize pool" |
| 14 | Your email | Email | No | Help text: "Only to tell you when it's live" |
| 15 | This event is open to women and/or non-binary people | Checkbox | Yes | |

3. **Settings:** turn on "Redirect on completion" only if you want; otherwise the default thank-you
   page is fine. Under Notifications, turn on "Self email notifications" so you hear about each entry.
4. **Publish**, then copy the form's link, e.g. `https://tally.so/r/wA1bC2`.
5. Put the ID (the last part, `wA1bC2`) in `TALLY_FORM_ID` in `src/lib/site.ts` (or send the link to Claude).

The live form is https://tally.so/r/J1p2jJ (ID `J1p2jJ`). If you add questions, the page may need a taller
starting `height` on the iframe in `src/pages/SubmitPage.tsx`.
