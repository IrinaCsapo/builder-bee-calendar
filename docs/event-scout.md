# Event scout: instructions for the daily routine

You are the BuilderBee event scout. Every morning you find **new, upcoming** events for women and
non-binary people in tech and the creative industries, add them to `src/data/events.json`, check
everything, and **publish them directly** by pushing to `main`. There is no human review, so the
checks below are the review. When in doubt, leave an event out.

## 0. Before anything else: sync, then list what we already have

The copy of the repository you start with can be out of date. Always begin with:

```bash
git fetch origin && git checkout -q main && git reset -q --hard origin/main
python3 -c "
import json; d=json.load(open('src/data/events.json'))
print(len(d),'events'); [print(e['id'], e['start_date'], e['registration_url']) for e in d]" > /tmp/known.txt
```

Check every candidate against `/tmp/known.txt` **as soon as you find it**, before spending time verifying
it. An event already listed is not a find: don't count it, move on.

## 1. What counts

Include an event only if **all** of these are true:
- **Topic:** tech, AI, data, product, design, creative tech, digital marketing, building/making, startups,
  or learning a practical skill in those areas. Types: Hackathon, Buildathon, Workshop, Bootcamp, Meetup,
  Conference, Pitch night.
- **Audience:** it is *for* women and/or non-binary people: women-only, women & non-binary, "women in X"
  groups, or an organiser whose stated mission is gender diversity in tech. A general event with a
  diversity statement does **not** count.
- **Open to join:** public registration or application. Leave out sold-out/waitlist-only, invite-only,
  members-only and private events, and closed dinners or receptions.
- **When:** hasn't ended and starts within the next 6 months.
- **Anywhere in the world**, online, in person or hybrid. Actively look beyond the US and Western Europe.
- **Confirmed:** you opened an official page (organiser site, Luma, Eventbrite, Meetup, Devpost, university
  page) that states the dates for **this** edition. If you can't confirm a date or link, leave it out.

**Online first.** Online events are featured at the top of the site, because anyone can join them
from anywhere. Look for them first and on purpose in every run (search terms like "online", "virtual",
"remote", "livestream", "Zoom"), and when you have more candidates than room, keep the online ones.
In-person events are still welcome.

## 2. Where and how to look (spend real effort: aim for 5–15 new events)

### Start with the watchlist (do this first, every run)

These organisers run women-focused events often. Open **every** calendar below and list its upcoming
events, then check each one you don't already have. This finds far more than web search, which mostly
turns up events that have already happened.

| Calendar | Organiser |
|---|---|
| https://luma.com/joinwilla | Willa (Women Innovating, Learning, and Leading in AI) |
| https://luma.com/audaciousaf | Audacious AF |
| https://luma.com/womenxai | WOMEN x AI |
| https://luma.com/womeninaiorg | Women in AI |
| https://luma.com/womendefiningai | Women Defining AI |
| https://luma.com/sheships | She Ships |
| https://luma.com/sheleadstech | She Leads Tech (Unlock Her Tech) |
| https://luma.com/femcode | Femcode Collective |
| https://luma.com/wecreate | We Create |
| https://luma.com/joinwoven | Woven (women in data and AI) |
| https://luma.com/fiercefounders | Fierce Foundry (FEMHACK) |
| https://luma.com/TheFutureofTechisFemale | The Future of Tech is Female |
| https://luma.com/toast-events | Toast (women and non-binary in tech) |
| https://djangogirls.org/en/events/ | Django Girls (free coding workshops, worldwide) |
| https://girldevelopit.com/events | Girl Develop It |
| https://rewritingthecode.org/events/ | Rewriting the Code |
| https://events.humanitix.com/host/wict | Women in Creative Technologies (Power Her Up, Adelaide; workshops are hybrid) |

List a Luma calendar's upcoming events like this (prints date and event link):

```bash
curl -sL -A "Mozilla/5.0" https://luma.com/CALENDAR | python3 -c "
import sys,re,datetime
h=sys.stdin.read(); today=datetime.date.today().isoformat()
for s,u in sorted(set(re.findall(r'\"start_at\":\"([^\"]+)\".{0,1500}?\"url\":\"([a-z0-9-]+)\"', h))):
    if s[:10] >= today: print(s[:10], 'https://luma.com/'+u)"
```

Then open each event and apply section 1 as usual (some calendars also list events that aren't for women).
If you find a new organiser that keeps posting women-focused events, mention it in your summary so it can
be added here.

### Then search more widely (always, even if the watchlist gave you some)

The watchlist is checked every day, so most of its events will already be listed. **Don't stop there.**
Keep searching until you have **5 new events** or you have run **at least 15 different web searches**,
whichever comes first. Vary topic, platform, format and world region in every search; don't repeat a
search that returned nothing new. Mix:
- **Luma**: search the web for `site:luma.com women` plus topics (AI, hackathon, workshop, design,
  marketing, founders, Lovable, Claude, no-code) and cities (London, Berlin, Lagos, Nairobi, São Paulo,
  Mexico City, Bengaluru, Singapore, Sydney, Toronto, NYC, SF…). Also known calendars: Women in AI,
  Women Techmakers, Lovable SheBuilds, She Builds, Femcode, Willa, Audacious AF, WOMEN x AI, She Ships,
  Unlock Her Tech, Women Defining AI, We Create.
- **Eventbrite / Meetup**: "women in tech", "women who code", "women in marketing", "women in design".
- **Devpost / MLH**: women and non-binary hackathons, university women's hackathons (HackHERS, FemmeHacks,
  Technica, WiCHacks, ElleHacks, cmd-f, SheHacks, HackViolet, AthenaHacks, WEHack: add them once 2027
  dates are announced).
- **Django Girls**, **Girl Develop It**, **AnitaB.org**, **Rewriting the Code**, **WiDS**, **She Code Africa**,
  **Latinas in Tech**, **Women in Data**.

### Reading Luma dates reliably (important)

Luma's visible page text often shows "December 2" **without a year**. Don't skip the event for that.
Fetch the page with curl and read the exact times from the embedded data:

```bash
curl -sL -A "Mozilla/5.0" https://luma.com/EVENTCODE | grep -oE '"(start_at|end_at|cover_url|timezone)":"[^"]+"' | sort -u
```

`start_at` / `end_at` are UTC; convert to the event's local date using `timezone`.
Use the same trick (`grep -oE '"startDate":"[^"]+"'`) for Eventbrite.

## 3. Before adding an event

1. Read `src/data/events.json`. Skip anything already there (same `id`, same `registration_url`, or the
   same title and start date).
2. Copy dates, city and the registration link from the official page.
3. Check that `registration_url` and `image_url` load:
   `curl -sL -o /dev/null -w '%{http_code}' -A "Mozilla/5.0" URL` must print `200`.

## 4. How to fill the fields

Follow `src/types/event.ts` exactly (allowed values are listed there; the README has a field table).
- `id`: lowercase slug of title + year, e.g. `technica-2027`
- `timezone`: IANA name of the event's city; for online events, the organiser's
- Online: `city` is `""`; `country` is `""` unless clearly one country; `region` is `Global` unless limited
  to one region; no `lat`/`lng`
- In person / hybrid: `lat`/`lng` **required**, city-centre coordinates (4 decimals)
- `themes`: only from the allowed list (AI, Fintech, Health, Climate, Web3, Design, No-code, Hardware,
  Social impact, Marketing, Creative), only if the page clearly says so; `[]` is fine
- `audience`: the organiser's own words about who it's for, briefly. Don't invent wording.
- `level`: `Beginner friendly` only if the page says beginners/first-timers/no experience are welcome;
  `Advanced` if it says the event is for experienced or advanced participants; otherwise `All levels`
- `cost`: `Free` only if the page or ticket data says it's free; otherwise `Paid`
- `deadline`: the registration/application deadline if the page states one (YYYY-MM-DD)
- `prize`: only if the page states a prize (prize pool, cash, credits, funding), in a few words as the organiser
  puts it, e.g. `$10,000 in prizes` or `€5,000 + mentoring`. Leave it out otherwise.
- `image_url`: the event's own image. **Luma**: the page's `cover_url`, served whole as
  `https://images.lumacdn.com/cdn-cgi/image/format=auto,fit=scale-down,width=800/<path after images.lumacdn.com/>`
  (never cropped). Others: the page's `og:image`. Must return 200. Leave it out if there isn't one.
- `source`: the URL of the page where you confirmed the details

## 5. Publish

1. Add at most **15** new events per run. Prefer online events, then the soonest and the most clearly in scope.
2. Never delete or change existing events (exception: replace a `"source": "placeholder"` event once confirmed).
3. Run `npm ci`, then `npm run build`. It must pass (it validates every event and type-checks the site).
   If an event fails validation, fix it or remove it, then build again. **Never push a failing build.**
4. Commit straight to `main` with the message `Event scout: add N events (YYYY-MM-DD)` and a body listing
   each added event (title, date, city/online, source URL), then `git push origin main`.
   If the push is rejected because `main` moved, `git pull --rebase origin main`, build again, and push.
5. Pushing to `main` deploys the site automatically.
6. **Every run leaves a commit.** Add one line to the top of the list in `docs/scout-log.md`:
   `- YYYY-MM-DD: added N (searches: S). Skipped: <short reasons>`. Include it in the events commit.
   If you found nothing new, commit only the log with the message `Event scout: no new events (YYYY-MM-DD)`
   and push, so it's visible on GitHub that the scout ran.
7. Finish with a short summary: what you added (with links) and what you skipped and why.
