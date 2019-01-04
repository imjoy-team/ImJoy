/*global docute*/
docute.init({
  title: 'ImJoy Documentation', // Default to `<title>` value
  repo: 'oeway/imjoy',
  twitter: 'weioyang',
  'edit-link': 'https://github.com/oeway/ImJoy/blob/master/web/public/docs',
  tocVisibleDepth: 4,
  sidebar: true,
  disableSidebarToggle: true,
  nav: [
    // homepage
    {path: '/', source: 'overview.md'},
    {title: 'ImJoy.IO', path: 'https://imjoy.io'},
    {title: 'Overview', path: '/overview', source: 'overview.md'},
    {title: 'Getting Started', path: '/getting-started', source: 'getting_started.md'},
    {title: 'User Manual', path: '/user-manual', source: 'user_manual.md'},
    {title: 'Development', path: '/development', source: 'development.md'},
    {title: 'ImJoy API', path: '/api', source: 'api.md'},
    {title: 'Demos', path: '/demos', source: 'demos.md'},
    // {
    //   title: 'getting started',
    //   path: '/get-started',
    //   markdown: '**click** <button @click="count++">{{count}}</button>',
    //   component: {
    //     data: () => ({count: 0})
    //   }
    // }
  ]
})
