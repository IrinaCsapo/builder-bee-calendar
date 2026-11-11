// Site-wide links. Change them here and they update everywhere.
export const REPO_URL = 'https://github.com/IrinaCsapo/builder-bee-calendar';
export const SUBMIT_FORM_URL = `${REPO_URL}/issues/new?template=submit-event.yml`;
export const SUBMISSIONS_URL = `${REPO_URL}/issues?q=label%3Aevent-submission`;

// The Tally form on the Submit page (no account needed to fill it in). Paste the form's ID here:
// it's the end of its link, e.g. https://tally.so/r/wA1bC2 → 'wA1bC2'. Empty = GitHub form only.
// The questions to add in Tally are in docs/tally-form.md.
export const TALLY_FORM_ID = 'J1p2jJ';

// TODO: replace with the show's real name and link
export const SHOW_NAME = 'the show';
export const SHOW_URL = '#/about';

// The two of us, shown on the About page. Leave linkedin empty to show the name without a link.
export const FOUNDERS = [
  { name: 'Irina', linkedin: 'https://www.linkedin.com/in/irinacsapo/' },
  { name: 'Tracey', linkedin: 'https://www.linkedin.com/in/traceywindsor-host/' },
];
