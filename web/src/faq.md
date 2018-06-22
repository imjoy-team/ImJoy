export const source = `

## How to import script in the plugin?
There are two different mode for the plugin to run a certain code: in webworker mode, you can use the original importScripts function, notice that it's synchronized version;
in iframe mode, we provided a importScripts function, but it's an async version, means you can use promise or await on that.

In order to unify the code, the recommended way is, if you want to load multiple scripts in order, and use Promise.resolve to normalize the result into a promise.

For example the following code will behave the same in webworker mode or iframe mode:

\`\`\`
Promise.resolve(importScripts("https://xxxx/script1.js", "https://xxxx/script2.js")).then(()=>{
  console.log('scripts loaded.')
})
\`\`\`



`
