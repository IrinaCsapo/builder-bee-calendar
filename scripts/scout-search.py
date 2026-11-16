#!/usr/bin/env python3
"""Event scout helper: search Eventbrite and Luma directly for upcoming events for women and
non-binary people in tech, and print the ones that aren't on BuilderBee yet.

    python3 scripts/scout-search.py            # everything
    python3 scripts/scout-search.py eventbrite # one source only
    python3 scripts/scout-search.py luma
    python3 scripts/scout-search.py --all      # don't filter titles for women / non-binary words

Prints one line per candidate: date, where, source, title, link. These are only leads: open each one
and apply the rules in docs/event-scout.md before adding it. Uses only the standard library.
"""
import json
import re
import sys
import time
import urllib.error
import urllib.parse
import urllib.request
from datetime import date, timedelta
from pathlib import Path

UA = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130 Safari/537.36'
TODAY = date.today().isoformat()
HORIZON = (date.today() + timedelta(days=183)).isoformat()

# Eventbrite: search terms (as URL slugs) x places. "online" is searched with every term; cities with fewer.
# Eventbrite blocks bursts of requests (HTTP 429), so each run searches online plus a few cities, taking turns
# by day, and stops asking Eventbrite at the first block.
EB_CITIES_PER_RUN = 4
EB_PAUSE = 3  # seconds between Eventbrite requests
EB_TERMS = [
    'women-in-tech', 'women-hackathon', 'women-coding', 'women-in-ai', 'women-in-data', 'women-in-design',
    'women-in-product', 'women-in-games', 'women-game-jam', 'women-founders-tech', 'non-binary-tech',
    'girls-who-code', 'women-no-code', 'women-cybersecurity',
]
EB_CITY_TERMS = ['women-in-tech', 'women-hackathon', 'women-in-ai']
EB_PLACES = [
    'united-kingdom--london', 'ireland--dublin', 'germany--berlin', 'netherlands--amsterdam', 'france--paris',
    'spain--barcelona', 'nigeria--lagos', 'kenya--nairobi', 'south-africa--cape-town', 'india--bengaluru',
    'singapore--singapore', 'australia--sydney', 'canada--toronto', 'ny--new-york', 'ca--san-francisco',
    'brazil--sao-paulo', 'mexico--mexico-city',
]

# Luma: search terms, run worldwide and then near each city (Luma ranks results by distance).
LUMA_TERMS = [
    'women hackathon', 'women AI', 'women in tech', 'women coding', 'women build', 'women founders',
    'women data', 'women design', 'women game jam', 'non-binary tech', 'female founders', 'she builds',
]
LUMA_CITY_TERMS = ['women tech', 'women AI', 'women hackathon']
LUMA_CITIES = {
    'London': (51.5072, -0.1276), 'Berlin': (52.52, 13.405), 'Paris': (48.8566, 2.3522),
    'Lagos': (6.5244, 3.3792), 'Nairobi': (-1.2921, 36.8219), 'Bengaluru': (12.9716, 77.5946),
    'Singapore': (1.3521, 103.8198), 'Sydney': (-33.8688, 151.2093), 'Toronto': (43.6532, -79.3832),
    'New York': (40.7128, -74.006), 'San Francisco': (37.7749, -122.4194), 'São Paulo': (-23.5505, -46.6333),
    'Mexico City': (19.4326, -99.1332), 'Dubai': (25.2048, 55.2708),
}


class Blocked(Exception):
    pass


# Keep only results whose title names the audience (search engines return lots of loosely related events).
# Pass --all to see everything.
AUDIENCE = re.compile(
    r"\b(wom[ae]n|woman's|women's|female|femme|fem|girls?|ladies|lady|she|her|hers|sisters?|non-?binary|enby|"
    r"trans|queer|lgbt\w*|mujeres|mulheres|femmes|frauen|donne|wit|wim|wiai|wids|femhack\w*|\w*hers)\b",
    re.I)


def get(url):
    req = urllib.request.Request(url, headers={'User-Agent': UA, 'Accept-Language': 'en'})
    for attempt in range(2):
        try:
            with urllib.request.urlopen(req, timeout=30) as r:
                return r.read().decode('utf-8', 'replace')
        except urllib.error.HTTPError as e:
            if e.code in (403, 429):
                raise Blocked(f'{url}: HTTP {e.code}')
            err = e
        except Exception as e:  # timeouts: wait and retry once
            err = e
        time.sleep(3)
    print(f'  ! {url}: {err}', file=sys.stderr)
    return ''


def known():
    """Links and ids already on BuilderBee (Eventbrite links compared by their numeric id)."""
    events = json.loads(Path(__file__).resolve().parent.parent.joinpath('src/data/events.json').read_text())
    keys = set()
    for e in events:
        for u in (e.get('registration_url'), e.get('source')):
            if u:
                keys.add(key(u))
    return keys


def key(url):
    url = url.split('?')[0].rstrip('/').lower()
    m = re.search(r'eventbrite\.[a-z.]+/e/.*?(\d{9,})$', url)
    if m:
        return 'eb:' + m.group(1)
    m = re.search(r'(?:lu\.ma|luma\.com)/([a-z0-9-]+)$', url)
    if m:
        return 'luma:' + m.group(1)
    return url


def eventbrite():
    out = []
    start = date.today().toordinal() * EB_CITIES_PER_RUN % len(EB_PLACES)
    cities = [EB_PLACES[(start + i) % len(EB_PLACES)] for i in range(EB_CITIES_PER_RUN)]
    print(f'Eventbrite: online + {", ".join(cities)}', file=sys.stderr)
    jobs = [(t, 'online') for t in EB_TERMS] + [(t, p) for p in cities for t in EB_CITY_TERMS]
    for term, place in jobs:
        for page in (1, 2):
            try:
                html = get(f'https://www.eventbrite.com/d/{place}/{term}/?page={page}')
            except Blocked as e:
                print(f'  ! Eventbrite stopped answering ({e}); using what it gave so far.', file=sys.stderr)
                return out
            found = 0
            for block in re.findall(r'<script type="application/ld\+json">(.*?)</script>', html, re.S):
                try:
                    data = json.loads(block)
                except ValueError:
                    continue
                for item in (data.get('itemListElement') or []) if isinstance(data, dict) else []:
                    e = item.get('item', item)
                    loc = e.get('location') or {}
                    where = 'Online' if loc.get('@type') == 'VirtualLocation' else \
                        ((loc.get('address') or {}).get('addressLocality') or loc.get('name') or place)
                    out.append(((e.get('startDate') or '')[:10], where, 'eventbrite', e.get('name', ''), e.get('url', '')))
                    found += 1
            time.sleep(EB_PAUSE)
            if found < 20:
                break
    return out


def luma():
    out = []
    jobs = [(t, None) for t in LUMA_TERMS] + [(t, c) for c in LUMA_CITIES for t in LUMA_CITY_TERMS]
    for term, city in jobs:
        params = {'pagination_limit': 50, 'query': term}
        if city:
            params['latitude'], params['longitude'] = LUMA_CITIES[city]
        try:
            text = get('https://api.lu.ma/discover/get-paginated-events?' + urllib.parse.urlencode(params))
        except Blocked as e:
            print(f'  ! Luma stopped answering ({e}); using what it gave so far.', file=sys.stderr)
            return out
        try:
            entries = json.loads(text).get('entries', []) if text else []
        except ValueError:
            entries = []
        for entry in entries:
            e = entry.get('event', {})
            geo = e.get('geo_address_info') or {}
            where = 'Online' if e.get('location_type') == 'online' else (geo.get('city') or geo.get('city_state') or '?')
            out.append(((e.get('start_at') or '')[:10], where, 'luma', e.get('name', ''), 'https://luma.com/' + e.get('url', '')))
        time.sleep(0.5)
    return out


def main():
    show_all = '--all' in sys.argv
    which = [a for a in sys.argv[1:] if not a.startswith('--')] or ['eventbrite', 'luma']
    have = known()
    rows = []
    if 'eventbrite' in which:
        rows += eventbrite()
    if 'luma' in which:
        rows += luma()
    seen, fresh = set(), []
    for d, where, src, name, url in rows:
        k = key(url)
        if not d or not url or k in seen or not (TODAY <= d <= HORIZON):
            continue
        seen.add(k)
        if k not in have and (show_all or AUDIENCE.search(name)):
            fresh.append((d, where, src, name, url))
    fresh.sort(key=lambda r: (r[1] != 'Online', r[0]))  # online first, then soonest
    for d, where, src, name, url in fresh:
        print(f'{d}  {where[:18]:<18}  {src:<10}  {name[:80]}  {url}')
    print(f'\n{len(fresh)} candidates not on BuilderBee yet ({len(seen)} upcoming results in total).', file=sys.stderr)


if __name__ == '__main__':
    main()
