;(function(win) {
  win.EditOnGithubPlugin = {}

  function create(docBase, docEditBase, title) {
    title = title || 'Edit on github'
    docEditBase = docBase.replace(/\/blob\//, '/edit/')

    function editDoc(event, vm) {
      var docName = vm.route.file

      if (docName) {
        var editLink
        if(docName === 'https://raw.githubusercontent.com/imjoy-team/ImJoy/master/README.md'){
          editLink = 'https://github.com/imjoy-team/ImJoy/edit/master/README.md'
        }
        else{
          editLink= docEditBase + docName
        }
        window.open(editLink)
        event.preventDefault()
        return false
      } else {
        return true
      }
    }

    win.EditOnGithubPlugin.editDoc = editDoc

    return function(hook, vm) {
      win.EditOnGithubPlugin.onClick = function(event) {
        EditOnGithubPlugin.editDoc(event, vm)
      }

      var header = [
        '<div style="overflow: auto">',
        '<p style="float: right"><a href="',
        docBase,
        '" target="_blank" onclick="EditOnGithubPlugin.onClick(event)">',
        title,
        '</a></p>',
        '</div>'
      ].join('')

      hook.afterEach(function (html) {
        return header + html
      })
    }
  }

  win.EditOnGithubPlugin.create = create
}) (window)
