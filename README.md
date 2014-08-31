# Require.js - Require NPM modules in the Browser

This is an extension of the ideas found in [this Gist](https://gist.github.com/mathisonian/c325dbe02ea4d6880c4e). However, I wanted to make it _pretend_ to act more like how `require` works in a true CommonJS environment.

## Require.js in action

- TODO: Add gif of require.js in action

## Usage
At a REPL
```javascript
var react = require('react');
// Some time later (best on a REPL)
// You will see 'Successfully loaded module' printed when you can do this.
var HelloWorld = react.createClass({
  render: function() { return react.DOM.div({}, 'Hello, World!'); }
});
react.renderComponent(HelloWorld(), document.body);
```

Programmatically
```javascript
require('react').then(function(react) {
  // It was loaded successfully!
  var HelloWorld = react.createClass({
    render: function() { return react.DOM.div({}, 'Hello, World!'); }
  });
  react.renderComponent(HelloWorld(), document.body);
}, function(reason) {
  // There was a problem!
  console.error(reason);
});
```

## How it works
When `require` is called, a function object is created, and returned to the caller. This function is a [Promises/A+](http://promisesaplus.com/) promise. In addition, when it is called, it redirects all arguments to the module exports object (assuming it has been loaded).

When the file has been loaded, as many properties of the original exports object are copied over to the original return value as possible, including all iterable properties, `prototype` (if `module.exports` is a function), and the object's prototype.

The original export object can be accessed at `.__realExports`

## Should I use this?
No, this shouldn't be used in production.

That being said, Chrome's console is much nicer to work with than the NPM one, so it might be nice to use this for testing various javascript functions & libraries at an interactive repl.


