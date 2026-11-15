import type { ComponentType, SVGProps } from 'react';
import {
  AdjustmentsHorizontalIcon, CalendarDaysIcon, EnvelopeIcon, GlobeAltIcon, LockClosedIcon, MagnifyingGlassIcon,
  MapPinIcon, PencilSquareIcon, RocketLaunchIcon, ShieldCheckIcon,
} from '@heroicons/react/24/outline';
import { ArrowRightIcon } from '@heroicons/react/20/solid';
import { useDocumentTitle } from '../lib/useDocumentTitle';
import { allEvents } from '../lib/events';
import { getUpcoming } from '../lib/dates';
import { ALL_COMMUNITIES } from '../data/communities';
import './HowItWorksPage.css';

type Icon = ComponentType<SVGProps<SVGSVGElement>>;

// The hero lab's colours, one per step / feature
const STEPS: { icon: Icon; colour: string; title: string; text: React.ReactNode }[] = [
  {
    icon: MagnifyingGlassIcon, colour: '#7B00DA', title: 'We look every morning',
    text: 'Our event scout checks the calendars of groups that run events for women and non-binary people, and searches for new ones in every region.',
  },
  {
    icon: PencilSquareIcon, colour: '#FF6600', title: 'Or you tell us',
    text: <>Know one we’re missing? <a href="/submit">Submit it</a> in about two minutes. No account needed.</>,
  },
  {
    icon: ShieldCheckIcon, colour: '#0006FA', title: 'We check it',
    text: 'Every event must be real, upcoming, open to women and non-binary builders, with a registration link that works.',
  },
  {
    icon: RocketLaunchIcon, colour: '#21B700', title: 'It goes live',
    text: 'It’s added to the calendar, the site updates within minutes, and it goes into the next weekly email.',
  },
];

const FEATURES: { icon: Icon; title: string; text: React.ReactNode }[] = [
  { icon: AdjustmentsHorizontalIcon, title: 'Search and filter', text: 'By name, city or theme. Online or in person, free, beginner friendly or advanced.' },
  { icon: GlobeAltIcon, title: 'Online first', text: 'Online events are featured at the top, because anyone can join them from anywhere.' },
  { icon: MapPinIcon, title: 'Near you', text: 'Events in your country show up first. Change the place under More filters.' },
  { icon: CalendarDaysIcon, title: 'Everything on one page', text: 'Dates, cost, level and who it’s for. Add it to your calendar or share it in one tap.' },
  { icon: EnvelopeIcon, title: 'Never miss one', text: <>Get new events <a href="/subscribe">every Monday by email</a>, or in your own calendar.</> },
  { icon: LockClosedIcon, title: 'Your details stay yours', text: 'You register on the organiser’s own site. BuilderBee never asks for your details.' },
];

const upcoming = getUpcoming(allEvents);
const countries = new Set(upcoming.map((e) => e.country).filter(Boolean)).size;
// A few community names for the "Find your people" band
const SAMPLE = ALL_COMMUNITIES.slice(0, 8).map((c) => c.name);

export function HowItWorksPage() {
  useDocumentTitle('How it works');
  return (
    <div className="container how">
      <header className="how__intro">
        <p className="how__kicker">How it works</p>
        <h1>Every event for women in tech, in one calendar</h1>
        <p className="how__lede">
          BuilderBee gathers hackathons, workshops, meetups and conferences for women, non-binary people and allies in
          tech, online and around the world. Free, and no account needed.
        </p>
        <dl className="how__stats">
          <div><dt>Upcoming events</dt><dd>{upcoming.length}</dd></div>
          <div><dt>Communities</dt><dd>{ALL_COMMUNITIES.length}</dd></div>
          <div><dt>Countries</dt><dd>{countries}</dd></div>
          <div><dt>New events checked</dt><dd>Daily</dd></div>
        </dl>
      </header>

      <section className="how__section" aria-labelledby="how-steps">
        <h2 id="how-steps">How events get on BuilderBee</h2>
        <ol className="how__steps">
          {STEPS.map(({ icon: Icon, colour, title, text }, i) => (
            <li key={title} className="how__step" style={{ ['--step' as string]: colour }}>
              <span className="how__step-top">
                <span className="how__step-icon"><Icon aria-hidden="true" /></span>
                <span className="how__step-num" aria-hidden="true">{String(i + 1).padStart(2, '0')}</span>
              </span>
              <h3>{title}</h3>
              <p>{text}</p>
            </li>
          ))}
        </ol>
      </section>

      <section className="how__section" aria-labelledby="how-find">
        <h2 id="how-find">Finding your next event</h2>
        <ul className="how__features">
          {FEATURES.map(({ icon: Icon, title, text }) => (
            <li key={title} className="how__feature">
              <Icon className="how__feature-icon" aria-hidden="true" />
              <h3>{title}</h3>
              <p>{text}</p>
            </li>
          ))}
        </ul>
      </section>

      <section className="how__people" aria-labelledby="how-people">
        <div>
          <h2 id="how-people">Find your people</h2>
          <p>
            Most events come from groups that run them all year round. Follow the ones you like so you hear about their
            next event first.
          </p>
          <a className="how__button how__button--dark hive-hover" href="/communities">
            See all {ALL_COMMUNITIES.length} communities <ArrowRightIcon className="icon" aria-hidden="true" />
          </a>
        </div>
        <ul className="how__chips" aria-label="Some of the communities">
          {SAMPLE.map((name) => <li key={name}>{name}</li>)}
          <li className="how__chips-more">and {ALL_COMMUNITIES.length - SAMPLE.length} more</li>
        </ul>
      </section>

      <section className="how__end" aria-labelledby="how-end">
        <h2 id="how-end">Ready to find your next event?</h2>
        <div className="how__actions">
          <a className="how__button how__button--dark hive-hover" href="/">Browse events</a>
          <a className="how__button how__button--light hive-hover hive-hover--on-light" href="/submit">Submit an event</a>
        </div>
      </section>
    </div>
  );
}
