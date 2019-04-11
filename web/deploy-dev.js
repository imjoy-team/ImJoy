var ghpages = require('gh-pages');
ghpages.publish('dist', {
    branch: 'gh-pages',
    dotfiles: true,
    repo: 'git@github.com:oeway/dev.imjoy.io.git'
  },
  function(err) {
    if(err){
      console.error(err)
    }
    else{
      console.log('deployed successfully.')
    }
});
