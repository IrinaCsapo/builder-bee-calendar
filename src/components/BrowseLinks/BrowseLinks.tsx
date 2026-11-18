import { allEvents } from '../../lib/events';
import { getUpcoming } from '../../lib/dates';
import { cityCollections, MIN_EVENTS, REGIONS, TOPICS, type Collection } from '../../lib/collections';
import './BrowseLinks.css';

const upcoming = getUpcoming(allEvents);
const count = (c: Collection) => upcoming.filter(c.match).length;
// Only link to pages with something on them
const worth = (list: Collection[]) => list.map((c) => ({ c, n: count(c) })).filter(({ n }) => n >= MIN_EVENTS);

const GROUPS = [
  { title: 'By type', items: worth(TOPICS) },
  { title: 'By region', items: worth(REGIONS) },
  { title: 'By city', items: worth(cityCollections(allEvents)).sort((a, b) => b.n - a.n) },
];

/** Links to the topic, region and city pages (also how search engines find them) */
export function BrowseLinks({ current }: { current?: string }) {
  return (
    <nav className="browse-links" aria-labelledby="browse-links-title">
      <h2 id="browse-links-title">Browse events</h2>
      {GROUPS.filter((g) => g.items.length).map((g) => (
        <div key={g.title} className="browse-links__group">
          <h3>{g.title}</h3>
          <ul>
            {g.items.map(({ c, n }) => (
              <li key={c.path}>
                <a href={c.path} aria-current={c.path === current ? 'page' : undefined}>
                  {c.label} <span>{n}</span>
                </a>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </nav>
  );
}
