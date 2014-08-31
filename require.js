(function() {
  function attach(target, body) {
    // Extract the value from the module
    var module = {
      exports: {}
    };
    var exports = module.exports;
    eval(body);

    // Attempt to copy over values! This is done in a seperate chance to avoid the
    // chance of variables clashing between the scope the eval occurs in and this one
    (function() {
      var onFulfilled = target.__onFulfilled;
      delete target.__onFulfilled;
      delete target.__onRejected;

      // Copy over all iterable properties from the actual exports object
      var hasOwnProperty = Object.prototype.hasOwnProperty;
      for (var k in module.exports) {
        if (hasOwnProperty.call(module.exports, k) && k !== 'then') {
          target[k] = module.exports[k];
        }
      }

      // Copy over the prototype if it is set
      if (typeof module.exports === 'function') {
        target.prototype = module.exports.prototype;
      }

      // Try to set the object prototype?
      Object.setPrototypeOf(target, Object.getPrototypeOf(module.exports));

      // Copy over the important values
      target.__status = 'success';
      target.__realExports = module.exports;

      console.log('Successfully loaded module');

      // Run the callbacks
      onFulfilled.forEach(function(cb) {
        cb(module.exports);
      });
    })();
  }

  // Fire an XMLHttpRequest to get the data!
  function fireRequest(target, moduleName) {
    var req = new XMLHttpRequest();
    req.onreadystatechange = function() {
      if (req.readyState === 4) {
        if (req.status === 200) {
          // We have successfully loaded the file!
          attach(target, req.responseText);
        } else {
          console.error('Unable to load module ' + moduleName);
          target.__status = 'error';
          target.__onRejected.forEach(function(cb) {
            cb('Unable to load module ' + moduleName);
          });
        }
      }
    };

    req.open('GET', 'http://wzrd.in/standalone/' + moduleName + '@latest', true);
    req.send(null);
  }

  function require(resource) {
    // Create a pseudo-export object - this will _pretend_ to be the actual exports
    var exports = function () {
      if (exports.__realExports) {
        if (typeof exports.__realExports === 'function') {
          return exports.__realExports.apply(this, arguments);
        } else {
          throw new Error('Attempt to call non-function');
        }
      } else {
        throw new Error('Attempt to call unloaded module');
      }
    };

    // The pseudo-exports object is a Promises/A+ promise
    exports.then = function(onFulfilled, onRejected) {
      return new Promise(function(resolve, reject) { // ES6 promise object
        var fulfilledAction = function (v) {
          if (typeof onFulfilled === 'function') {
            try {
              var np = onFulfilled.apply(this, arguments);
            } catch(e) {
              reject(e);
              return;
            }

            resolve(np);
          } else {
            resolve(v);
          }
        };

        var rejectedAction = function (v) {
          if (typeof onRejected === 'function') {
            try {
              var np = onRejected.apply(this, arguments);
            } catch(e) {
              reject(e);
              return;
            }

            resolve(np);
          } else {
            reject(v);
          }
        };

        if (exports.__status === 'success') {
          fulfilledAction(exports.__realExports);
        } else if (exports.__status === 'loading') {
          exports.__onFulfilled.push(fulfilledAction);
          exports.__onRejected.push(rejectedAction);
        } else if (exports.__status === 'error') {
          rejectedAction(exports.__realExports);
        }
      });
    };

    exports.__status = 'loading';
    exports.__onFulfilled = [];
    exports.__onRejected = [];

    console.log('Retrieving NPM module: ' + resource + '...');
    fireRequest(exports, resource);

    return exports;
  }

  window.require = require;
})();
