docute.init({
  title: 'ImJoy Documentation', // Default to `<title>` value
  sidebar: [
  ],
  // landing: 'GettingStarted.md',
  nav: [
    // homepage
    {title: 'Getting Started', path: '/getting-started', source: 'GettingStarted.md'},
    {title: 'Tutorial', path: '/tutorial', source: 'Tutorial.md'},
    {title: 'API', path: '/api', source: 'API.md'},
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
