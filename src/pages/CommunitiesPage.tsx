import { ArrowRightIcon, ArrowUpRightIcon } from '@heroicons/react/20/solid';
import { useDocumentTitle } from '../lib/useDocumentTitle';
import { allEvents } from '../lib/events';
import { communityEvents } from '../lib/communityEvents';
import { ALL_COMMUNITIES, COMMUNITY_GROUPS, communitySlug, type Community } from '../data/communities';
import './HowItWorksPage.css';
import './CommunitiesPage.css';

// One hero-lab colour per group
export const GROUP_COLOURS = ['#7B00DA', '#FF6600', '#0006FA', '#21B700', '#FE06E5', '#009BE9'];

const groupId = (title: string) => `group-${title.toLowerCase().replace(/[^a-z]+/g, '-').replace(/-$/, '')}`;
const count = (c: Community) => communityEvents(c, allEvents).length;
const withEvents = ALL_COMMUNITIES.filter((c) => count(c) > 0).length;

/** The first letters of a name, for the avatar: "She Ships" -> "SS", "Django Girls" -> "DG" */
export function initials(name: string) {
  const words = name.replace(/[^A-Za-z0-9 ]/g, ' ').split(/\s+/).filter((w) => w && !/^(by|and|the|of|in|x)$/i.test(w));
  return (words.length > 1 ? words[0][0] + words[1][0] : words[0]?.slice(0, 2) ?? '?').toUpperCase();
}

export function CommunitiesPage() {
  useDocumentTitle('Communities');

  return (
    <div className="container how communities">
      <header className="how__intro">
        <p className="how__kicker">Communities</p>
        <h1>Find your people</h1>
        <p className="how__lede">
          Groups and organisations that run events for women, non-binary people and allies in tech. Follow the ones
          you like so you hear about their next event first.
        </p>
        <dl className="how__stats communities__stats">
          <div><dt>Communities</dt><dd>{ALL_COMMUNITIES.length}</dd></div>
          <div><dt>With events on BuilderBee now</dt><dd>{withEvents}</dd></div>
        </dl>
        <nav className="communities__jump" aria-label="Jump to a group">
          {COMMUNITY_GROUPS.map((g, i) => (
            <a key={g.title} href={`#${groupId(g.title)}`} style={{ ['--group' as string]: GROUP_COLOURS[i % GROUP_COLOURS.length] }}>
              {g.title} <span>{g.communities.length}</span>
            </a>
          ))}
        </nav>
      </header>

      {COMMUNITY_GROUPS.map((group, gi) => {
        const colour = GROUP_COLOURS[gi % GROUP_COLOURS.length];
        return (
          <section key={group.title} className="how__section communities__group" aria-labelledby={groupId(group.title)}
            style={{ ['--group' as string]: colour }}>
            <h2 id={groupId(group.title)}>{group.title}</h2>
            <ul className="communities__grid">
              {group.communities.map((c) => {
                const n = c.search ? count(c) : 0;
                return (
                  <li key={c.url} className="community">
                    <div className="community__top">
                      <span className="community__avatar" aria-hidden="true">{initials(c.name)}</span>
                      <span className="community__where">{c.where}</span>
                    </div>
                    <h3 className="community__name">
                      {n > 0 ? <a href={`/community/${communitySlug(c)}`}>{c.name}</a> : c.name}
                    </h3>
                    <p className="community__about">{c.about}</p>
                    <div className="community__actions">
                      {n > 0 && (
                        <a className="community__events hive-hover" href={`/community/${communitySlug(c)}`}>
                          {n} upcoming {n === 1 ? 'event' : 'events'}
                          <span className="visually-hidden"> by {c.name} on BuilderBee</span>
                          <ArrowRightIcon className="icon" aria-hidden="true" />
                        </a>
                      )}
                      <a className="community__site" href={c.url} target="_blank" rel="noopener noreferrer">
                        Visit<span className="visually-hidden"> {c.name} (opens in a new tab)</span>
                        <ArrowUpRightIcon className="icon" aria-hidden="true" />
                      </a>
                    </div>
                  </li>
                );
              })}
            </ul>
          </section>
        );
      })}

      <section className="how__people communities__missing" aria-labelledby="communities-missing">
        <div>
          <h2 id="communities-missing">Know a group we’re missing?</h2>
          <p>
            Submit one of their events and we’ll add them here too. Our daily event scout also checks many of these
            groups every morning.
          </p>
        </div>
        <div>
          <a className="how__button how__button--dark hive-hover" href="/submit">
            Submit an event <ArrowRightIcon className="icon" aria-hidden="true" />
          </a>
        </div>
      </section>
    </div>
  );
}
