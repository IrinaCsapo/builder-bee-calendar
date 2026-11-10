/**
 * Groups and organisations that run events for women, non-binary people and allies in tech.
 * Shown on the Communities page (#/communities).
 *
 * To add one: pick a group, add an entry, and keep `about` short and in the organiser's own spirit.
 * `search` (optional) is what the page types into the event search to list their upcoming events on
 * BuilderBee. Search matches every word anywhere in an event, so use a distinctive word from the
 * `organiser` field ("Audacious", not "Women in AI").
 */
export interface Community {
  name: string;
  url: string;
  about: string;
  where: string;
  search?: string;
}

export interface CommunityGroup {
  title: string;
  communities: Community[];
}

export const COMMUNITY_GROUPS: CommunityGroup[] = [
  {
    title: 'Learn to code and build',
    communities: [
      {
        name: 'Django Girls',
        url: 'https://djangogirls.org',
        about: 'Free one-day workshops where women learn to build websites with Python and Django.',
        where: 'Worldwide, in person',
        search: 'Django',
      },
      {
        name: 'Girl Develop It',
        url: 'https://girldevelopit.com',
        about: 'Skill-based courses, career development and events, including a virtual hackathon.',
        where: 'US and online',
        search: 'Girl Develop',
      },
      {
        name: 'Femcode Collective',
        url: 'https://luma.com/femcode',
        about: 'Monthly meetups for women and non-binary people to vibe code their ideas into MVPs.',
        where: 'Helsinki and online',
        search: 'Femcode',
      },
      {
        name: 'She Ships',
        url: 'https://luma.com/sheships',
        about: 'A community for women in software development to connect, grow and support one another.',
        where: 'Online',
        search: 'She Ships',
      },
      {
        name: 'She Leads Tech by Unlock Her Tech',
        url: 'https://luma.com/sheleadstech',
        about: 'Interactive sessions and hands-on workshops for women, non-binary people and allies in tech.',
        where: 'London and online',
        search: 'She Leads Tech',
      },
      {
        name: 'She Code Africa',
        url: 'https://shecodeafrica.org',
        about: 'A non-profit equipping African girls and women with digital skills in technology.',
        where: 'Africa',
      },
      {
        name: 'Latinas in Tech',
        url: 'https://latinasintech.org',
        about: 'Connecting, supporting and empowering Latina women working in tech.',
        where: 'US and online',
      },
      {
        name: 'Technovation and Women Techmakers',
        url: 'https://www.technovation.org',
        about: 'Skills, mentors and a global network for builders in 160+ countries, now home to Women Techmakers.',
        where: 'Worldwide',
        search: 'Technovation',
      },
    ],
  },
  {
    title: 'AI and data',
    communities: [
      {
        name: 'Willa',
        url: 'https://luma.com/joinwilla',
        about: 'Women Innovating, Learning, and Leading in AI: live expert-led events and hands-on workshops.',
        where: 'Online',
        search: 'Willa',
      },
      {
        name: 'Women in AI',
        url: 'https://www.womeninai.co',
        about: 'A nonprofit, community-driven initiative bringing knowledge about AI through education and events.',
        where: 'Worldwide chapters',
        search: 'ML6',
      },
      {
        name: 'WOMEN x AI',
        url: 'https://luma.com/womenxai',
        about: 'Women working across AI and technology: founders, executives and community builders.',
        where: 'San Francisco Bay Area and online',
      },
      {
        name: 'Women Defining AI',
        url: 'https://www.womendefiningai.org',
        about: 'A nonprofit educating people about AI and promoting inclusive tech, with regular community events.',
        where: 'US and online',
        search: 'Defining',
      },
      {
        name: 'Audacious AF',
        url: 'https://luma.com/audaciousaf',
        about: 'Female leaders who are AI-curious and AI builders, closing the gap one skillshare and workshop at a time.',
        where: 'New York and online',
        search: 'Audacious',
      },
      {
        name: 'Woven',
        url: 'https://luma.com/joinwoven',
        about: 'A community for women in data and AI.',
        where: 'Toronto',
        search: 'Woven',
      },
      {
        name: 'WiDS Worldwide',
        url: 'https://www.widsworldwide.org',
        about: 'Women in Data Science: conferences, datathons and events in the field of data science.',
        where: 'Worldwide',
      },
      {
        name: 'Women in Data',
        url: 'https://www.womenindata.co.uk',
        about: 'Events and mentoring for women in data, analytics and business intelligence.',
        where: 'UK',
      },
    ],
  },
  {
    title: 'Founders, business and creative tech',
    communities: [
      {
        name: 'Women in Creative Technologies',
        url: 'https://wictadl.wixstudio.com/my-site',
        about: 'Runs Power Her Up for women in business in South Australia: skills workshops, founder meet-ups and a design sprint.',
        where: 'Adelaide, in person and online',
      },
      {
        name: 'The Future of Tech is Female',
        url: 'https://luma.com/TheFutureofTechisFemale',
        about: 'Belgium’s biggest event weeks dedicated to women in tech.',
        where: 'Belgium',
        search: 'Future of Tech is Female',
      },
      {
        name: 'Fierce Foundry',
        url: 'https://luma.com/fiercefounders',
        about: 'A FemTech venture studio that runs FEMHACK.',
        where: 'Dallas',
        search: 'Fierce',
      },
      {
        name: 'We Create',
        url: 'https://luma.com/wecreate',
        about: 'Knowledge, tools and support for women builders, makers, designers and founders.',
        where: 'Miami',
      },
      {
        name: 'Toast',
        url: 'https://luma.com/toast-events',
        about: 'Monthly events for women and non-binary people in tech.',
        where: 'Canada',
        search: 'Toast',
      },
    ],
  },
  {
    title: 'Students, hackathons and conferences',
    communities: [
      {
        name: 'Rewriting the Code',
        url: 'https://rewritingthecode.org',
        about: 'A free community of 50,000+ university and early-career women in tech.',
        where: 'Worldwide, mostly online',
        search: 'Rewriting',
      },
      {
        name: 'AnitaB.org',
        url: 'https://anitab.org',
        about: 'Programs and events for women in tech, including Grace Hopper Celebration and GHCI in India.',
        where: 'Worldwide',
        search: 'AnitaB',
      },
      {
        name: 'ACM-W',
        url: 'https://women.acm.org',
        about: 'Supporting, celebrating and advocating for women in computing, with local chapters and celebrations.',
        where: 'Worldwide chapters',
        search: 'ACM-W',
      },
      {
        name: 'WiCyS',
        url: 'https://www.wicys.org',
        about: 'Women in CyberSecurity: a yearly conference for women and allies in cybersecurity.',
        where: 'US',
        search: 'WiCyS',
      },
      {
        name: 'Technica',
        url: 'https://gotechnica.org',
        about: 'The world’s largest hackathon celebrating underrepresented genders.',
        where: 'Maryland, US',
      },
      {
        name: 'HackHERS',
        url: 'https://www.ruhackhers.org',
        about: 'Rutgers Women in Computer Science’s 24-hour hackathon, with workshops and mentorship.',
        where: 'New Jersey, US',
      },
      {
        name: 'FemmeHacks',
        url: 'https://femmehacks.io',
        about: 'An inclusive all-women and non-binary hackathon at the University of Pennsylvania.',
        where: 'Philadelphia, US',
      },
      {
        name: 'InnovateHer',
        url: 'https://innovateherhacks.org',
        about: 'A women-centric hackathon at Purdue University.',
        where: 'Indiana, US',
        search: 'InnovateHer',
      },
    ],
  },
];
