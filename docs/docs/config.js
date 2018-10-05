docute.init({
  title: 'ImJoy Documentation', // Default to `<title>` value
  landing: [],
  repo: 'oeway/imjoy',
  twitter: 'weioyang',
  'edit-link': 'https://github.com/oeway/ImJoy/blob/master/docs/docs',
  tocVisibleDepth: 4,
  nav: [
    // homepage
    {title: 'ImJoy.IO', path: 'https://imjoy.io'},
    {title: 'Overview', path: '/overview', source: 'overview.md'},
    {title: 'Quick Start', path: '/quickstart', source: 'quickstart.md'},
    {title: 'Architecture', path: '/architecture', source: 'architecture.md'},
    {title: 'Development', path: '/development', source: 'development.md'},
    {title: 'API', path: '/api', source: 'api.md'},
    {title: 'Tutorial', path: '/tutorial', source: 'tutorial.md'},
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
