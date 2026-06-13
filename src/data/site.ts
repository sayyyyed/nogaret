export const site = {
  name: '',
  description: 'A long-term personal knowledge hub for software engineering, AI, education, and digital research.',
  url: 'https://example.com',
  author: 'Amir',
};

export const primaryNavigation = [
  { label: 'Blog', href: '/blog/' },
  { label: 'Tutorials', href: '/tutorials/' },
  { label: 'Research', href: '/research/' },
  { label: 'Notes', href: '/notes/' },
  { label: 'Projects', href: '/projects/' },
  { label: 'Labs', href: '/labs/' },
  { label: 'Visualizations', href: '/visualizations/' },
];

export const secondaryNavigation = [
  { label: 'About', href: '/about/' },
  { label: 'Now', href: '/now/' },
  { label: 'Uses', href: '/uses/' },
  { label: 'Bookmarks', href: '/bookmarks/' },
  { label: 'Reading', href: '/reading/' },
  { label: 'Timeline', href: '/timeline/' },
  { label: 'Changelog', href: '/changelog/' },
  { label: 'Contact', href: '/contact/' },
];

export const socialLinks = [
  { label: 'GitHub', href: 'https://github.com/', platform: 'github' },
  { label: 'LinkedIn', href: 'https://www.linkedin.com/', platform: 'linkedin' },
  { label: 'Behance', href: 'https://www.behance.net/', platform: 'behance' },
  { label: 'Google Scholar', href: 'https://scholar.google.com/', platform: 'scholar' },
] as const;
