/*global docute*/
docute.init({
  title: 'ImJoy Documentation',
  repo: 'oeway/imjoy',
  twitter: 'weioyang',
  'edit-link': 'https://github.com/oeway/ImJoy/blob/master/web/src/docs',
  tocVisibleDepth: 4,
  sidebar: true,
  disableSidebarToggle: true,
  nav: [
    {path: '/', source: 'overview.md'},
    {title: 'ImJoy.IO', path: 'https://imjoy.io'},
    {title: 'Overview', path: '/overview', source: 'overview.md'},
    {title: 'Getting Started', path: '/getting-started', source: 'getting_started.md'},
    {title: 'User Manual', path: '/user-manual', source: 'user_manual.md'},
    {title: 'Development', path: '/development', source: 'development.md'},
    {title: 'ImJoy API', path: '/api', source: 'api.md'},
    {title: 'Demos', path: '/demos', source: 'demos.md'},
  ]
})
