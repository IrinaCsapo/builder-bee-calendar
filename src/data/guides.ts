// Guides at /guides/<slug>: a few useful articles, written by hand, each linking to the events that go with it.
// Used by the app (GuidePage, GuidesPage) and by scripts/prerender.ts (HTML, Article structured data, sitemap).
//
// Writing a guide: each section is a heading plus blocks. A block is a paragraph (string) or a bullet list
// (array of strings). Links inside text are written [like this](/hackathons). Keep facts checkable, and
// update `updated` when you change a guide.

import type { CalendarEvent } from '../types/event';

export interface GuideSection {
  heading: string;
  blocks: (string | string[])[];
}

export interface Guide {
  slug: string;
  kicker: string;
  title: string;          // the h1 and <title>
  description: string;    // the lede and meta description
  published: string;      // YYYY-MM-DD
  updated: string;        // YYYY-MM-DD
  colour: string;
  sections: GuideSection[];
  /** Which upcoming events to show under the guide */
  events: (e: CalendarEvent) => boolean;
  eventsHeading: string;
  /** Topic, region or city pages to point to (paths) */
  related: string[];
}

/** Events that start within `days` days either side of a date that comes round every year */
const around = (month: number, day: number, days = 10) => (e: CalendarEvent) => {
  const start = new Date(`${e.start_date}T00:00:00Z`).getTime();
  const year = Number(e.start_date.slice(0, 4));
  return [year - 1, year, year + 1].some((y) => Math.abs(start - Date.UTC(y, month - 1, day)) <= days * 864e5);
};

export const GUIDES: Guide[] = [
  {
    slug: 'what-is-a-hackathon',
    kicker: 'First-timer’s guide',
    title: 'What is a hackathon? A first-timer’s guide for women and non-binary builders',
    description: 'What actually happens at a hackathon, whether you need to code, what it costs, and how to pick your first one, from two people who run a calendar of them.',
    published: '2026-11-25',
    updated: '2026-11-25',
    colour: '#7B00DA',
    eventsHeading: 'Hackathons coming up',
    events: (e) => e.event_type === 'Hackathon' || e.event_type === 'Buildathon',
    related: ['/hackathons', '/beginners', '/online', '/free-credits'],
    sections: [
      {
        heading: 'A hackathon in one sentence',
        blocks: [
          'A hackathon is an event where people form small teams and build something, usually an app, website or prototype, in a short, fixed time, then show it to everyone at the end.',
          'The name mixes “hack” (in the sense of building something quickly and cleverly) and “marathon”. Most last a day or a weekend, some run online for a week or more. A buildathon is the same idea, often with a gentler pace and more help along the way.',
        ],
      },
      {
        heading: 'What happens on the day',
        blocks: [
          'Every hackathon is a little different, but most follow the same shape:',
          [
            'Kick-off: the organisers explain the theme or challenge, the rules, the prizes and how judging works. Sponsors often introduce the tools you can use.',
            'Forming teams: you can come with a team or join one there. Most events have a team-matching session for people who arrive alone, and teams are usually two to five people.',
            'Building: the long middle part. Mentors walk around (or sit in a chat channel) to help when you get stuck. Food and drinks are usually provided at in-person events.',
            'Demos: each team shows what they built, often in two to five minutes. It doesn’t need to be finished, it needs to show the idea working.',
            'Judging and prizes: judges pick winners, sometimes in several categories, such as best use of a sponsor’s tool or best beginner team.',
          ],
        ],
      },
      {
        heading: 'Do I need to know how to code?',
        blocks: [
          'No. Teams need people who can design, research, write, plan, test and present just as much as people who write code. Many hackathons now welcome no-code builders, and AI tools such as Lovable and Claude mean you can build a working prototype by describing what you want.',
          'If you’re new, look for events labelled [beginner friendly](/beginners). They say up front that first-timers are welcome, and they often start with a short workshop on the tools.',
        ],
      },
      {
        heading: 'Why women-only and women and non-binary hackathons?',
        blocks: [
          'Plenty of people go to their first hackathon and find they’re one of very few women in the room. Events for women and non-binary people take that away, which makes it easier to ask questions, try bigger ideas and come back for the next one.',
          'Every event on BuilderBee is for women and/or non-binary people in tech, and some also welcome allies. Each listing quotes the organiser’s own words about who it’s for, so check that before you register.',
        ],
      },
      {
        heading: 'What does it cost?',
        blocks: [
          'Most hackathons are free to join. Sponsors pay for the venue, food and prizes because they want people to try their tools. Some events also give you [free credits](/free-credits) for AI and developer tools, so you can keep building afterwards.',
          'For in-person events, the cost is usually getting there. If travel is a barrier, try an [online hackathon](/online) first.',
        ],
      },
      {
        heading: 'How to pick your first one',
        blocks: [
          [
            'Start online or close to home, so it’s easy to leave if you need to.',
            'Look for “beginner friendly”, mentors, and a team-matching session.',
            'Pick a theme you care about. It’s much easier to build for a problem you understand.',
            'Check the registration deadline. Popular events fill up, and BuilderBee shows how long you have left.',
          ],
        ],
      },
      {
        heading: 'What to bring',
        blocks: [
          [
            'A laptop and charger (and a plug adapter if you’re travelling).',
            'Accounts set up in advance for the tools the organisers mention, so you don’t lose the first hour to sign-ups.',
            'One or two rough ideas, but be ready to drop them for a better one from your team.',
            'Something comfortable to wear, and a water bottle.',
          ],
        ],
      },
      {
        heading: 'After the hackathon',
        blocks: [
          'Keep in touch with your team and post what you built. A demo video and a short write-up on LinkedIn is the kind of portfolio piece that starts conversations. Then pick the next one: there are new hackathons on [BuilderBee](/hackathons) every week.',
        ],
      },
    ],
  },
  {
    slug: 'women-in-tech-days-2027',
    kicker: 'Dates for your diary',
    title: 'Women in tech and STEM awareness days in 2027',
    description: 'The days that celebrate women in science, technology and engineering in 2027, from International Day of Women and Girls in Science to Ada Lovelace Day, and how to take part.',
    published: '2026-11-25',
    updated: '2026-11-25',
    colour: '#FF6600',
    eventsHeading: 'Events coming up',
    events: () => true,
    related: ['/online', '/hackathons', '/meetups', '/conferences'],
    sections: [
      {
        heading: 'The days at a glance',
        blocks: [
          [
            'International Day of Women and Girls in Science: Thursday 11 February 2027.',
            'International Women’s Day: Monday 8 March 2027.',
            'International Girls in ICT Day: Thursday 22 April 2027.',
            'International Women in Engineering Day: Wednesday 23 June 2027.',
            'Ada Lovelace Day: Tuesday 12 October 2027.',
          ],
          'Organisers often plan hackathons, talks and meetups around these days, so they’re a good time to look for events. We add them to [BuilderBee](/) as soon as they’re announced.',
        ],
      },
      {
        heading: 'International Day of Women and Girls in Science (11 February)',
        blocks: [
          'A United Nations day, marked every year on 11 February since 2016. It’s about getting more women and girls into science and keeping them there. Universities, labs and schools run open days and talks, and it’s often called “women in STEM day”.',
        ],
      },
      {
        heading: 'International Women’s Day (8 March)',
        blocks: [
          'The biggest day of the year for women’s events, in tech and everywhere else. Expect conferences, panels, hackathons and meetups all through the week, and many tech companies host free events for the public. Popular ones fill up early, so register as soon as you see one.',
        ],
      },
      {
        heading: 'International Girls in ICT Day (fourth Thursday of April)',
        blocks: [
          'Run by the International Telecommunication Union (ITU), the UN’s agency for digital technology. It encourages girls and young women to study and work in technology. Most events are for school and university students: coding workshops, mentoring and company visits.',
        ],
      },
      {
        heading: 'International Women in Engineering Day (23 June)',
        blocks: [
          'Started in the UK in 2014 by the Women’s Engineering Society, and now marked around the world. Each year has a theme, and companies and universities celebrate the women engineers they work with. Read [our guide to the day](/guides/international-women-in-engineering-day).',
        ],
      },
      {
        heading: 'Ada Lovelace Day (second Tuesday of October)',
        blocks: [
          'A day to celebrate the achievements of women in science, technology, engineering and maths, named after the mathematician often called the first computer programmer. Read [our guide to Ada Lovelace Day](/guides/ada-lovelace-day).',
        ],
      },
      {
        heading: 'How to take part, any day of the year',
        blocks: [
          [
            'Go to an event: there are [online events](/online) you can join from anywhere, every week.',
            'Build something at a [hackathon](/hackathons) with other women and non-binary builders.',
            'Write a post about a woman in tech who helped you, and tag her.',
            'Run your own meetup, and [add it to BuilderBee](/submit) so people can find it.',
          ],
        ],
      },
    ],
  },
  {
    slug: 'ada-lovelace-day',
    kicker: 'Ada Lovelace Day',
    title: 'Ada Lovelace Day 2027: who Ada was and how to take part',
    description: 'Ada Lovelace Day celebrates women in science, technology, engineering and maths. Here’s who Ada Lovelace was, when the day is in 2027, and ways to mark it.',
    published: '2026-11-25',
    updated: '2026-11-25',
    colour: '#0006FA',
    eventsHeading: 'Events around Ada Lovelace Day',
    events: around(10, 12, 14),
    related: ['/hackathons', '/meetups', '/online', '/ai'],
    sections: [
      {
        heading: 'When is Ada Lovelace Day?',
        blocks: [
          'Ada Lovelace Day is held on the second Tuesday of October. In 2027 that’s Tuesday 12 October. It was started in 2009 by Suw Charman-Anderson to celebrate the achievements of women in science, technology, engineering and maths, and to create new role models.',
        ],
      },
      {
        heading: 'Who was Ada Lovelace?',
        blocks: [
          'Ada Lovelace (1815–1852) was an English mathematician and the daughter of the poet Lord Byron. She worked with Charles Babbage on his Analytical Engine, a mechanical general-purpose computer that was designed but never built.',
          'In 1843 she translated an Italian engineer’s article about the machine and added her own notes, which were longer than the article itself. One of them sets out step by step how the engine could calculate Bernoulli numbers, which is why she’s often called the first computer programmer. She also saw that a machine like this could work with more than numbers, for example to compose music, long before computers existed.',
          'The programming language Ada, created for the US Department of Defense around 1980, is named after her.',
        ],
      },
      {
        heading: 'Ways to take part',
        blocks: [
          [
            'Tell someone’s story: write a short post about a woman in tech or science whose work you admire, and tag her if she’s on LinkedIn.',
            'Go to an event: many groups run talks, meetups and hackathons in the week around the day.',
            'Build something: join a [hackathon](/hackathons) and spend the day making, which is what Ada was writing about.',
            'Give your time: offer to mentor someone starting out, or speak at a local meetup.',
          ],
          'Looking for other dates? See [women in tech awareness days in 2027](/guides/women-in-tech-days-2027).',
        ],
      },
    ],
  },
  {
    slug: 'international-women-in-engineering-day',
    kicker: 'INWED',
    title: 'International Women in Engineering Day 2027: what it is and how to take part',
    description: 'International Women in Engineering Day (INWED) is on 23 June. Here’s where it came from, what happens, and how to join in, wherever you are.',
    published: '2026-11-25',
    updated: '2026-11-25',
    colour: '#21B700',
    eventsHeading: 'Events around INWED',
    events: around(6, 23, 14),
    related: ['/hackathons', '/conferences', '/meetups', '/europe'],
    sections: [
      {
        heading: 'When is International Women in Engineering Day?',
        blocks: [
          'Every year on 23 June. In 2027 it falls on a Wednesday. It’s often shortened to INWED.',
        ],
      },
      {
        heading: 'Where it came from',
        blocks: [
          'INWED was started in the UK in 2014 by the Women’s Engineering Society (WES), a charity founded in 1919 to support women in engineering. It began as a national day and is now marked around the world. WES announces a theme each year and shares the day’s events and stories.',
        ],
      },
      {
        heading: 'What happens on the day',
        blocks: [
          'Companies, universities and schools celebrate the women engineers they work with, publish their stories, and run open days, talks and workshops. Online, people share the hashtag #INWED with posts about women engineers they admire.',
          'Software engineering counts too. If you build software, hardware, data systems or AI, it’s your day as well.',
        ],
      },
      {
        heading: 'How to take part',
        blocks: [
          [
            'Share the story of a woman engineer you work with or admire.',
            'Go to a talk, meetup or [hackathon](/hackathons) in the week around 23 June.',
            'Visit a school or university to talk about your work, or offer to mentor a student.',
            'Organising something? [Add it to BuilderBee](/submit) so more people can find it.',
          ],
          'Looking for other dates? See [women in tech awareness days in 2027](/guides/women-in-tech-days-2027).',
        ],
      },
    ],
  },
];

export const guideBySlug = (slug: string) => GUIDES.find((g) => g.slug === slug);

/** Splits "Look at [hackathons](/hackathons) now" into text and link parts */
export function inlineParts(text: string): { text: string; href?: string }[] {
  const parts: { text: string; href?: string }[] = [];
  const re = /\[([^\]]+)\]\(([^)]+)\)/g;
  let last = 0;
  for (let m; (m = re.exec(text)); last = re.lastIndex) {
    if (m.index > last) parts.push({ text: text.slice(last, m.index) });
    parts.push({ text: m[1], href: m[2] });
  }
  if (last < text.length) parts.push({ text: text.slice(last) });
  return parts;
}

/** Plain text without the link syntax, for descriptions and structured data */
export const plainText = (text: string) => text.replace(/\[([^\]]+)\]\([^)]+\)/g, '$1');
