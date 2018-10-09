# Tutorials


## Tutorials for distribution and deployment

### Distribution and deployment of a plugin with GitHub Gist

We assume that the entire code is contained in the plugin file and no extra
dependencies are required. [GitHub Gist](https://gist.github.com/) is a service provided by GitHub  to easily share individual files. Every gist is a GIT repository, so it provides version control, it can be forked and cloned.

#### Create gist

0. Export your ImJoy plugin (buttone on the title bar)
0. Go to gist on your GitHub account [https://gist.github.com/](https://gist.github.com/)
0. Create new gist and copy & paste the code of your plugin
0. Give a new followed `PluginName.imjoy.html`
0. Create either public or secret gist.
0. Link to gist can be obtained from the 'Raw' button. Please note that this url
will change when you update your file.

#### Distribute plugin with url
Once your plugin is on gist, you can distribute it with a single Link
`http://imjoy.io/#/app?plugin=LinkToGIST.imjoy.html`

You can also control where the plugin will be installed by setting the
workspace parameter `w=`:
`http://imjoy.io/#/app?w=PluginTest&plugin=LinkToGIST.imjoy.html`

### Distribution and deployment of code/data stored on Dropbox
This example describes how you can distribute and deploy a Python plugin
with code or data that is stored on Dropbox. Data could be example data to test
the plugin or a a pre-trained model for a neural network. This allows to share projects that are private.

1. The **code** or **data** is stored as a zip file on Dropbox. This allows to change
the code/data by replacing the zip file (see Notes below).
2. The ImJoy plugin file file (.imjoy.html) is hosted with a secret or public **gist**.

Let's assume the python code is in a Zip archive `testcode.zip` stored on Dropbox and
unavailable with the link `DROPBOXLINK/testcode.zip`. You can then place the following code-fragment in setup() function of your plugin to make it available. This fragment (requiring 'sys', 'os','requests','shutil') and performs the following steps

1. Performs an [http request](http://docs.python-requests.org). Please note the **dl=1** option in this request. By default this value is set to 0.
2. Uses the returned request object to generate the zip file locally, unpacks it, and finally deletes it.
3. Add the local path to the system path.

```Python
url = 'https://DROPBOXLINK/testcode.zip?dl=1'
r = requests.get(url, allow_redirects=True)

name_zip = os.path.join('.','testcode.zip')
open(name_zip, 'wb').write(r.content)
shutil.unpack_archive(name_zip)
os.remove(name_zip)
sys.path.append(os.path.join('.','testcode'))
```

**Notes**
1. Code is locally stored in `username/ImJoyWorkspace/WORKSPACENAME/testcode`, where WORKSPACENAME is the name of the current ImJoy workspace. You can set the workspace automatically in the URL your provideto distribute your plugin (next section).
2. When updating the zip archive, dont delete the old one REPLACE it with the new version. This guarantess that the same link is valid.
3. This code will install each time the Plugin is called the current version the zip archive.
