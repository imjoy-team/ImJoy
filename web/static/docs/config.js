docute.init({
  title: 'ImJoy Documentation', // Default to `<title>` value
  landing: [],
  nav: [
    // homepage
    {title: 'Overview', path: '/overview', source: 'Overview.md'},
    {title: 'Architecture', path: '/architecture', source: 'Architecture.md'},
    {title: 'Plugin development', path: '/developlugins', source: 'DevelopingPlugins.md'},
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
