// membrane.js
var assert = require('assert');

var membrane = {};

membrane.create = function(initTarget) {
  var revoked = false;

  var wrap = function(target) {
    if (Object(target) !== target) return target; // primitives are passed through
    
    var dummyTarget;
    if (typeof target === "function") {
      dummyTarget = target;
    } else {
      dummyTarget = Object.create(wrap(Object.getPrototypeOf(target)));      
    }

    var metaHandler = {
    	apply : function (target, thisArg, argumentsList) {
	        console.log("calling function: ");
	        return Reflect.apply(target, argumentsList);
        }, 
  		get : function (dummyTarget, propertyName) {
	        if (revoked) { throw new Error("membrane revoked"); }

	        return function(dummyTarget,...args) {
	          try {
	          	 return wrap(Reflect[propertyName](target, ...args.map(wrap)));
	          } catch (e) { throw wrap(e); }
        	}
    	}
	};
      
    wrapper = new Proxy(target, new Proxy(dummyTarget, metaHandler));
    return wrapper;
  }

  var revoke = function() { revoked = true; }

  return {revoke: revoke, ref: wrap(initTarget)};
}

// membrane.createProxy = function(initTarget) {

//   var wrap = function(target) {

// 	var handler = {
// 		get: function(target, name, receiver) {
// 			console.log("getting property: " + name);
// 			//console.log(name);
// 		    return Reflect.get(target, name, receiver);
// 	    },
// 	    apply : function (target, thisArg, argumentsList) {
// 	        console.log("calling function: " + target);
// 	        return Reflect.apply(target, thisArg, argumentsList);
//         }
// 	};
      
//     wrapper = new Proxy(target, handler);
//     return wrapper;
//   }
//   return wrap(initTarget);
//}

// var foo = function(){return "return-foo";};
// var fooMembrane = membrane.createProxy(foo);
//console.log(fooMembrane);
//console.log(fooMembrane());
//console.log(fooMembrane.ref());

// var x = { 'foo' : foo };
// var xMembrane = membrane.createProxy(x);
//console.log(xMembrane);
//console.log(xMembrane.foo);
//console.log(xMembrane.foo());

module.exports = membrane;
