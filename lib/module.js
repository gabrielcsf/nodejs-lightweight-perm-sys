'use strict';

const NativeModule = require('native_module');
const util = require('util');
const internalModule = require('internal/module');
const vm = require('vm');
const assert = require('assert').ok;
const fs = require('fs');
const path = require('path');
const internalModuleReadFile = process.binding('fs').internalModuleReadFile;
const internalModuleStat = process.binding('fs').internalModuleStat;
const preserveSymlinks = !!process.binding('config').preserveSymlinks;

// --------------------------------------------------------------------------
// ------------------------------MEMBRANE------------------------------------
// --------------------------------------------------------------------------
// var DoubleWeakMap = function() {
//   this.map = new WeakMap();
//   this.a = [];
//   this.b = [];
// };

// DoubleWeakMap.prototype = {
//   get: function(obj) {
//     var wo = this.map.get(obj);
//     if (wo)
//       return wo;
//     for (var i = 0; i < this.a.length; i++) {
//       if (obj === this.a[i])
//         return this.b[i];
//     }
//     return undefined;
//   },
//   set: function(obj, val) {
//     try {
//       return this.map.set(obj, val);
//     } catch(e) {
//       for (var i = 0; i < this.a.length; i++) {
//         if (obj === this.a[i]) {
//           this.b[i] = val;
//           return this;
//         }
//       }
//       this.a.push(obj);
//       this.b.push(val);
//       return this;
//     }
//   },
//   has: function(obj) {
//     // return this.map.has(obj);
//     return this.map.has(obj) || membrane.original.array_filter.call(this.a, function(o) { return o === obj; }).length > 0;
//   },
//   getOrCreate: function(obj, def) {
//     var result = this.get(obj);
//     if (result === undefined) {
//       this.set(obj, def);
//       return def;
//     }
//     return result;
//   },
//   print: function() {

//   }
// };

// // used to handle special cases of get trap
// var whitelist =  {
//     WeakMap: { // ES-Harmony proposal as currently implemented by FF6.0a1
//       prototype: {              
//         'delete': true
//       }
//     },      
//     Object: {           
//       prototype: {              
//         __defineGetter__: false,
//         __defineSetter__: false,
//         __lookupGetter__: false,
//         __lookupSetter__: false,

//         toString: true, 
//         valueOf: false,
//         hasOwnProperty: true,
//         isPrototypeOf: true,
//         propertyIsEnumerable: true
//       },            
//       getPrototypeOf: true,
//       getOwnPropertyDescriptor: true,
//       getOwnPropertyNames: true,
//       create: true,
//       defineProperty: true,
//       defineProperties: true,
//       seal: true,
//       freeze: false,
//       preventExtensions: false,
//       isSealed: true,
//       isFrozen: false,
//       isExtensible: false,
//       keys: true
//     },

//     Array: {
//       prototype: {
//         concat: true,
//         join: true,
//         pop: true,
//         push: true,
//         reverse: true,
//         shift: true,
//         slice: true,
//         sort: true,
//         splice: true,
//         unshift: true,
//         indexOf: true,
//         lastIndexOf: true,
//         every: true,
//         some: true,
//         forEach: true,
//         map: true,
//         filter: true,
//         reduce: true,
//         reduceRight: true,
//       },
//       isArray:true
//     },
//     String: {
//       prototype: { // these String prototype functions when called on dry objectrue, toString() is implicitly called on the dry objectrue, which is already handled.
//         substr: true, // ES5 Appendix B
//         anchor: true, // Harmless whatwg
//         big: true, // Harmless whatwg
//         blink: true, // Harmless whatwg
//         bold: true, // Harmless whatwg
//         fixed: true, // Harmless whatwg
//         fontcolor: true, // Harmless whatwg
//         fontsize: true, // Harmless whatwg
//         italics: true, // Harmless whatwg
//         link: true, // Harmless whatwg
//         small: true, // Harmless whatwg
//         strike: true, // Harmless whatwg
//         sub: true, // Harmless whatwg
//         sup: true, // Harmless whatwg
//         trimLeft: true, // non-standard
//         trimRight: true, // non-standard
//         valueOf: false,
//         charAt: true,
//         charCodeAt: true,
//         concat: true,
//         indexOf: true,
//         lastIndexOf: true,
//         localeCompare: true,
//         match: true,
//         replace: true,
//         search: true,
//         slice: true,
//         split: true,
//         substring: true,
//         startsWith: true,
//         endsWith: true,
//         toLowerCase: true,
//         toLocaleLowerCase: true,
//         toUpperCase: true,
//         toLocaleUpperCase: true,
//         trim: true,
//       },
//       fromCharCode: true
//     },
//     Boolean: {
//       prototype: { // these function prototype when called on dry object does not automatically call valueOf or toString of dry object
//         valueOf: false
//       }
//     },
//     Number: {
//       prototype: {
//         valueOf: false,
//         toFixed: false,
//         toExponential: false,
//         toPrecision: false
//       },
//     },
//     Math: {
//       abs: true,
//       acos: true,
//       asin: true,
//       atan: true,
//       atan2: true,
//       ceil: true,
//       cos: true,
//       exp: true,
//       floor: true,
//       log: true,
//       max: true,
//       min: true,
//       pow: true,
//       random: true, // questionable
//       round: true,
//       sin: true,
//       sqrt: true,
//       tan: true
//     },
//     Date: { // no-arg Date constructor is questionable
//       prototype: {
//         // Note: coordinate this list with maintanence of repairES5.js
//         getYear: false, // ES5 Appendix B
//         setYear: false, // ES5 Appendix B
//         toGMTString: false, // ES5 Appendix B2dsd
//         toDateString: false,
//         toTimeString: false,
//         toLocaleString: false,
//         toLocaleDateString: false,
//         toLocaleTimeString: false,
//         valueOf: false,
//         getTime: false,
//         getFullYear: false,
//         getUTCFullYear: false,
//         getMonth: false,
//         getUTCMonth: false,
//         getDate: false,
//         getUTCDate: false,
//         getDay: false,
//         getUTCDay: false,
//         getHours: false,
//         getUTCHours: false,
//         getMinutes: false,
//         getUTCMinutes: false,
//         getSeconds: false,
//         getUTCSeconds: false,
//         getMilliseconds: false,
//         getUTCMilliseconds: false,
//         getTimezoneOffset: false,
//         setTime: false,
//         setFullYear: false,
//         setUTCFullYear: false,
//         setMonth: false,
//         setUTCMonth: false,
//         setDate: false,
//         setUTCDate: false,
//         setHours: false,
//         setUTCHours: false,
//         setMinutes: false,
//         setUTCMinutes: false,
//         setSeconds: false,
//         setUTCSeconds: false,
//         setMilliseconds: false,
//         setUTCMilliseconds: false,
//         toUTCString: false,
//         toISOString: false,
//         toJSON: false
//       },
//       parse: true,
//       UTC: true,
//       now: false,
//     },
//     JSON: {
//       parse: true,
//       stringify: true
//     },        
//     Function:{
//       prototype:{
//         toString: true,
//         call: true,
//         apply: true,
//         bind: true
//       }
//     },
//     // Promise:{
//     //   prototype:{
//     //     then: true
//     //   }
//     // }
// };
// var membrane = {};
// membrane.debug = false;
// membrane.trapsDebug = false;
// membrane.contextDebug = false;
// membrane.functionCallsDebug = false;

// membrane.mainContext = "(mainFunction)";
// membrane.anonymousFunction = "(anonymousFunction)" 
// membrane.context = [];
// membrane.context.push(membrane.mainContext);
// membrane.functionCalls = new Map();
// membrane.permissions = new Map();
// membrane.mapUnwrapped2Wrapped = new DoubleWeakMap(); // store map from original objects to wrapped ones
// membrane.mapWrapped2Unwrapped = new DoubleWeakMap(); // store map from wrapped objects to original ones


// // functions/objects that need special handling
// membrane.whiteList = new WeakMap();
// membrane.specialFunctionsMap = new WeakMap();

// membrane.original = {
//   // some references to original prototype functions used by the membrane
//   error: Error,
//   object: Object,
//   functionPrototypeBind: Function.prototype.bind,
//   getOwnPropertyDescriptor: Object.getOwnPropertyDescriptor,
//   getOwnPropertyNames: Object.getOwnPropertyNames,
//   defineProperty: Object.defineProperty,
//   getPrototypeOf: Object.getPrototypeOf,
//   keys: Object.keys,
//   functionToString: Function.prototype.toString,
//   functionCall: Function.prototype.call,
//   objectToString: Object.prototype.toString,
//   objectCreate: Object.create,
//   objectHasOwnProperty:  Object.prototype.hasOwnProperty,
//   objectSeal: Object.seal,
//   freeze: Object.freeze,
//   preventExtensions: Object.preventExtensions,
//   isArray:  Array.isArray,
//   array_filter: Array.prototype.filter,
//   array_slice: Array.prototype.slice,
//   array_foreach: Array.prototype.forEach,
//   array_map: Array.prototype.map,
//   string_split: String.prototype.split,
//   originalString: String,
//   originalEval: eval,
// };

// membrane.specialFunctions = {
//   clearInterval : global.clearInterval,  
//   clearTimeout : global.clearTimeout,
//   setTimeout: global.setTimeout,
//   setInterval: global.setInterval,
//   eval: global.eval,
//   Function: global.Function,
//   Array: global.Array,
//   ArrayBuffer: global.ArrayBuffer,
//   Object: global.Object,
//   String: global.String, 
//   Number: global.Number, 
//   Boolean: global.Boolean,
//   RegExp: global.RegExp,
//   Date: global.Date,
//   Error: global.Error,
//   Uint8ClampedArray: global.Uint8ClampedArray,
//   Uint8Array: global.Uint8Array,  
//   Uint16Array: global.Uint16Array,
//   Uint32Array: global.Uint32Array,
//   Int8Array: global.Int8Array,
//   Int16Array: global.Int16Array,
//   Int32Array: global.Int32Array,
//   Float32Array: global.Float32Array,
//   Float64Array: global.Float64Array,
//   Promise: global.Promise,
//   pResolve: global.Promise.resolve,
//   functionToString: global.Function.prototype.toString,        
// };

// membrane.handleSpecialBuiltinFunction = function(obj, args, thisValue, objectName, callerContext, calleeContext, trap) {
//   var result;
  
//   if (obj === membrane.specialFunctions.functionToString) {
//     if (membrane.trapsDebug) console.log("[DEBUG-handleSpecialBuiltinFunction]: functionToString")

//     thisValue = membrane.getUnwrappedIfNotPrimitive(thisValue);
//     for (var i = 0; i < args.length; i++) {           
//       if (!membrane.isPrimitive(args[i])) {
//         args[i] = membrane.getUnwrapped(args[i]);                   
//       }
//     } 
//     result = membrane.specialFunctions.functionToString.apply(thisValue, args);      
//     return result;
//   } 

//   if (obj === membrane.specialFunctions.Array || obj === membrane.specialFunctions.ArrayBuffer) {    
//     if (membrane.trapsDebug) console.log("[DEBUG-handleSpecialBuiltinFunction]: Array object")
//     result = obj.apply(thisValue, args);  
//     return result;              
//   } 

//   if (obj === membrane.specialFunctions.setTimeout || obj === membrane.specialFunctions.setInterval) {
//     for (i = 0; i < args.length; i++) {           
//       args[i] = membrane.processSetValue(args[i], obj, objectName+"["+i+"]", callerContext, calleeContext);
//     }
//     result = obj.apply(thisValue, args);           
//     return result;              
//   }

//   // native constructors, should return a wet value. don't know about wetness of args
//   // this list is getting longer and includes methods, maybe we should separate it
//   if (obj === membrane.specialFunctions.Date || obj === membrane.specialFunctions.Object ||
//     obj === membrane.specialFunctions.String || obj === membrane.specialFunctions.Number ||
//     obj === membrane.specialFunctions.Boolean || obj === membrane.specialFunctions.RegExp ||
//     obj === membrane.specialFunctions.Error || obj == membrane.specialFunctions.Uint32Array ||
//     obj === membrane.specialFunctions.Promise || membrane.specialFunctions.pResolve || 
//     obj === membrane.specialFunctions.Function) {

//     if (trap === "apply")
//       return obj.apply(thisValue, args);
//     else if (trap === "construct")
//       return membrane.makeConstructor(obj, args)();
//   }
//   throw Error("[MEMBRANE] Not supported: " + String(obj));
// }

// membrane.makeConstructor = function(obj, args) {
//   //setup parameters
//   var paras = "";
//   for (var i = 0; i < args.length; i++) {
//     paras = paras + "args[" + i + "],";
//   }
//   var code = "new obj(" + paras.slice(0, paras.length - 1) + ");";
//   return function() {
//     return eval(code);
//   };
// }

// // checks if an object is a primitive (number, string, null, undefined) or not
// membrane.isPrimitive = function(obj) {
//   return Object(obj) !== obj;
// }

// // checks if an object is empty (TODO: rethink need of this function)
// membrane.isEmptyObject = function(obj) {
//     return typeof obj === "Object" && Object.keys(obj).length === 0;
// };

// // handle get operations results (can be used in any trap that behaves like a get operation)
// membrane.processGetValue = function(result, objectName, callerContext, calleeContext) {
//   if (membrane.debug) console.log("[DEBUG-processGetValue] Begin");
//   if (membrane.isPrimitive(result)) {
//     if (membrane.debug) { console.log("[DEBUG-processGetValue] Returning primitive result: "); console.log(result); }            
//     return result;
//   }

//   if (membrane.whiteList.has(result)) {
//     if (membrane.debug) { console.log("[DEBUG-processGetValue] Returning result from whitelist"); }            
//     return result;
//   }

//   var unwrappedResult = membrane.getUnwrapped(result);
//   if (membrane.isProxy(unwrappedResult)) {
//     if (membrane.debug) { console.log("[DEBUG-processGetValue] Returning unwrapped result "); }            
//     return unwrappedResult;
//   } else {
//     if (membrane.debug) { console.log("[DEBUG-processGetValue] Creating membrane around unwrapped result"); }            
//     return membrane.create(result, objectName);
//   }
// }

// // handle get operations results (can be used in any trap that behaves like a set operation)
// membrane.processSetValue = function(value, obj, objectName, callerContext, calleeContext) {
//   if (membrane.debug) console.log("[DEBUG-processSetValue] Begin");
//   var finalValue = value;
//   if (!membrane.isPrimitive(value)) {
//     if (membrane.debug) console.log("[DEBUG-processSetValue] Value is not primitive");

//     if (membrane.whiteList.has(value)) {
//       if (membrane.debug) { console.log("[DEBUG-processGetValue] Returning result from whitelist"); }            
//       return value;
//     }
//     if (membrane.debug) console.log("[DEBUG-processSetValue] Checking if value is wrapped");
//     var unwrappedValue = membrane.mapWrapped2Unwrapped.get(value);
//     if (unwrappedValue) { // was wrapped already
//       if (membrane.debug) console.log("[DEBUG-processSetValue] Checking if value is wrapped -> Result: value was already wrapped");
//       return finalValue;
//     } 
//     else {
//       if (membrane.debug) console.log("[DEBUG-processSetValue] Checking if value is wrapped -> Result: False");
//       if (membrane.debug) console.log("[DEBUG-processSetValue] Value is now wrapped by " + callerContext);
//       finalValue = membrane.create(value, callerContext + ".(anonymousFunction)");
//     }
//   }
//   return finalValue;
// }

// membrane.enterContext = function(objectName) {
//   var currentMembraneContext = membrane.context[membrane.context.length-1];
//   var currentContext = currentMembraneContext ? currentMembraneContext : membrane.mainContext;

//   if (membrane.functionCallsDebug) {
//     console.log("[MEMBRANE] FUNCTION-CALL FROM <" + currentContext + "> TO <" + objectName + ">");
//     //console.log("[DEBUG] Calling function/constructor: " + objectName + " from " + currentContext);
//   }

//   //membrane.checkPermission(currentContext, objectName);

//   // pushing new function context to stack
//   membrane.context.push(objectName);

//   // account for function call (objectName) in the current context
//   var counter = membrane.functionCalls.get(membrane.contextifyFunctioncall(objectName, currentContext));
//   counter = counter ? counter+ 1 : 1;
//   membrane.functionCalls.set(membrane.contextifyFunctioncall(objectName, currentContext), counter);
// }

// membrane.checkPermission = function(callerFunction, calleeFunction) {
//   console.log("Check Permission: " + callerFunction + " --- " + calleeFunction);
//   var callerModule = callerFunction.split(".")[0];
//   var calleeModule = calleeFunction.split(".")[0];

//   if (callerModule == membrane.mainContext) { return; }

//   var errorMessage = "Module " + callerModule + " does not have permission to call module " + calleeModule;

//   if (!membrane.permissions.has(callerModule)) {
//     // throw new Error(errorMessage);
//     console.log("ERROR MSG: " + errorMessage);
//   }

//   //var hasPermissions = false;
//   var callerModulePermission = membrane.permissions.get(callerModule);
//   if (callerModulePermission && Array.isArray(callerModulePermission)) {
//     var hasPermissions = callerModulePermission.find(function(e){ return e === calleeModule });
//     if (!hasPermissions) {
//       // throw new Error(errorMessage);
//           console.log(errorMessage);

//     }
//   }
// }

// membrane.exitContext = function() {
//   membrane.context.pop();
// }

// membrane.currentContext = function() { return membrane.context[membrane.context.length-1]; }

// // checks if an object is wrapped with a proxy or not
// membrane.isProxy = function(obj) {
//   return membrane.isPrimitive(obj) ? false : membrane.mapWrapped2Unwrapped.has(obj);
// }

// membrane.getWrapped = function(obj) {
//   if (obj && membrane.mapUnwrapped2Wrapped.has(obj)) {
//     return membrane.mapUnwrapped2Wrapped.get(obj);
//   }
//   return null;
// }

// // unwraps an object and returns a non-proxied reference of it
// membrane.getUnwrapped = function(obj) {
//   var uw = membrane.mapWrapped2Unwrapped.get(obj);
//   return uw ? uw : obj;
// }

// membrane.getUnwrappedIfNotPrimitive = function(obj) {
//   if (membrane.isPrimitive(obj)) {
//     return obj;
//   }
//   return membrane.getUnwrapped(obj);
// }

// // wraps an object and returns a proxied reference of it
// membrane.wrap = function(obj, objectName) {
//   var wrappedObj;

//   if (membrane.isPrimitive(obj)) return obj;

//   var objectToWrap = obj;  

//   wrappedObj = new Proxy(objectToWrap, {
//     // list of traps
//     // extracted from: http://www.ecma-international.org/ecma-262/6.0/#sec-proxy-object-internal-methods-and-internal-slots
//     getPrototypeOf: function(target) {
//       if (membrane.trapsDebug) console.log("[DEBUG-trap] trap: getPrototypeOf");
//       return Reflect.getPrototypeOf(target);
//     },
//     setPrototypeOf: function(target, prototype) {
//       if (membrane.trapsDebug) console.log("[DEBUG-trap]: setPrototypeOf");
//       return Reflect.setPrototypeOf(target, prototype);
//     },
//     isExtensible: function(target) {
//       if (membrane.trapsDebug) console.log("[DEBUG-trap]: isExtensible");
//       return Reflect.isExtensible(target);
//     },
//     preventExtensions: function(target) {
//       if (membrane.trapsDebug) console.log("[DEBUG-trap]: preventExtensions");
//       return Reflect.preventExtensions(target);
//     },
//     getOwnPropertyDescriptor: function(target, prop) {
//       if (membrane.trapsDebug) console.log("[DEBUG-trap]: getOwnPropertyDescriptor: " + String(prop));
//       return Reflect.getOwnPropertyDescriptor(target, prop);
//     },
//     defineProperty: function(target, prop, desc) {
//       if (membrane.trapsDebug) console.log("[DEBUG-trap]: defineProperty: " + String(prop));
//       //TODO: processSetValue (delegate package error)
//       // when setting a value that is already a proxy, should check whether it is configurable/writable and decide to unwrap it or not

//       // if (membrane.isProxy(descriptor)) {
//       //   if (membrane.debug) console.log("[DEBUG] descriptor is wrapped");
//       //   descriptor = membrane.getUnwrapped(desc);
//       // }
//       // descriptor.value = membrane.processSetValue(desc.value, obj, "", membrane.currentContext, membrane.currentContext);
//       return membrane.original.defineProperty(target, prop, desc);

//       // return wrappedObj;
//     },
//     has: function(target, prop) {
//       if (membrane.trapsDebug) console.log("[DEBUG-trap]: has: "+ String(prop));
//       return Reflect.has(target, prop);
//     },
//     set: function(target, prop, value, receiver) {
//       // if (membrane.trapsDebug) console.log("[DEBUG-trap]: set: " + + String(prop));
//       if (membrane.trapsDebug) console.log("[DEBUG-trap]: set in " + objectName + ": " + String(prop));  

//       return Reflect.set(target, prop, value, receiver);
//     },
//     deleteProperty: function(target, property) {
//       if (membrane.trapsDebug) console.log("[DEBUG-trap]: deleteProperty");
//       return Reflect.deleteProperty(target, property);  
//     },
//     ownKeys: function(target) {
//       if (membrane.trapsDebug) console.log("[DEBUG-trap]: ownKeys");
//       return Reflect.ownKeys(target);  
//     },
//     // get trap (used to intercept properties access)
//     get: function(target, propertyName, receiver) {
//       // if (membrane.trapsDebug) console.log("[DEBUG-trap]: get " + propertyName);  
//       console.log("[DEBUG-trap]: get in " + objectName + ": " + String(propertyName));  

//       // [TODO] check caller context and callee context?
//       var callerContext = membrane.currentContext();
//       callerContext = (callerContext.indexOf(".") === 0 || callerContext.indexOf("/") === 0) ? callerContext : callerContext.split('.')[0];

//       var calleeContext = objectName;
//       calleeContext = (calleeContext.indexOf(".") === 0 || calleeContext.indexOf("/") === 0)? calleeContext : calleeContext.split('.')[0];
      
//       var result = obj[propertyName];
      
//       // read-only/non-configurable objects cannot be wrapped (get trap will throw TypeError in these cases)
//       if (!membrane.isPrimitive(obj)) {
//         var targetDesc = membrane.original.getOwnPropertyDescriptor(obj, propertyName);
//         if (targetDesc && targetDesc.configurable != undefined) {
//           if (targetDesc.configurable == false) {
//             if (membrane.isProxy(result)) {
//               return result;
//             }
//             return membrane.getUnwrappedIfNotPrimitive(result);
//           }
//         }
//       }
//       result = membrane.processGetValue(result, String(objectName) + "." + String(propertyName), callerContext, calleeContext);     
//       return result;
//     },
//     // apply trap (used to intercept function calls)
//     apply: function (target, thisArg, argumentsList) {
//       if (membrane.trapsDebug) console.log("[DEBUG-trap]: apply ");
//       var result, functionCallresult;

//       // [TODO] check caller context and callee context?
//       var callerContext = membrane.currentContext();
//       callerContext = (callerContext.indexOf(".") === 0 || callerContext.indexOf("/") === 0) ? callerContext : callerContext.split('.')[0];

//       var calleeContext = objectName;
//       calleeContext = (calleeContext.indexOf(".") === 0 || calleeContext.indexOf("/") === 0)? calleeContext : calleeContext.split('.')[0];
      
//       if (membrane.contextDebug) console.log("[DEBUG-context] caller: " + callerContext + " ---- " + "callee: " + calleeContext);

//       // // handle special functions [TODO] rethink need
//       if (membrane.specialFunctionsMap.has(obj)) {
//           // policy check (if necessary in this function call)
//           if (membrane.debug) console.log("[DEBUG]: Handling special function (apply): " + membrane.specialFunctionsMap.get(obj)); 

//           result = membrane.handleSpecialBuiltinFunction(obj, argumentsList, thisArg, objectName, callerContext, calleeContext, "apply");
//           return result;
//       }

//       // var isNativeFunction = membrane.original.functionToString.call(obj).includes("[native code]");

//       // handle argumentsList (wrap or unwrap it before calling function)
//       for (var i = 0; i < argumentsList.length; i++) {
//         // if (!isNativeFunction && (typeof argumentsList[i] === "function")) {
//         if (typeof argumentsList[i] === "function") {
//           if (membrane.debug) console.log(">>> Processing function parameter..");
//           argumentsList[i] = membrane.processSetValue(argumentsList[i], obj, objectName+"["+i+"]", callerContext, calleeContext);
//         } else {
//           argumentsList[i] = membrane.getUnwrappedIfNotPrimitive(argumentsList[i]);
//         }
//       }

//       // // handle argumentsList (wrap or unwrap it before calling function)
//       // // native functions are always unwrapped before calling
//       // if (!isNativeFunction) {
//       //   thisArg = membrane.processSetValue(thisArg, obj, "[this]."+objectName, callerContext, calleeContext);
//       // } else {
//         thisArg = membrane.getUnwrappedIfNotPrimitive(thisArg);
//       // }

//       membrane.enterContext(objectName);
//       functionCallresult = obj.apply(thisArg, argumentsList);
//       membrane.exitContext();

//       result = membrane.processGetValue(functionCallresult, String(objectName), callerContext, calleeContext);
//       return result;
//     },
//     construct: function(target, argumentsList, newTarget) {
//       if (membrane.trapsDebug) console.log("[DEBUG-trap]: construct");
//       var result, constructorResult;

//       var callerContext = membrane.currentContext();
//       callerContext = (callerContext.indexOf(".") === 0 || callerContext.indexOf("/") === 0) ? callerContext : callerContext.split('.')[0];

//       var calleeContext = objectName;
//       calleeContext = (calleeContext.indexOf(".") === 0 || calleeContext.indexOf("/") === 0)? calleeContext : calleeContext.split('.')[0];
      
//       if (membrane.contextDebug) console.log("[DEBUG-context] caller: " + callerContext + " ---- " + "callee: " + calleeContext);

//       // handle special functions [TODO] rethink need
//       if (membrane.specialFunctionsMap.has(obj)) {
//           // policy check (if necessary in this function call)
//           if (membrane.debug) console.log("[DEBUG]: Handling special function (construct-trap): ");

//           result = membrane.handleSpecialBuiltinFunction(obj, argumentsList, null, objectName, callerContext, calleeContext, "construct");
//           // result = membrane.getUnwrappedIfNotPrimitive(result);
//           return result;
//       }

//       // handle argumentsList (wrap or unwrap it before calling function)
//       for (var i = 0; i < argumentsList.length; i++) {
//         argumentsList[i] = membrane.processSetValue(argumentsList[i], obj, objectName+"["+i+"]", callerContext, calleeContext);
//       }

//       newTarget = membrane.getUnwrappedIfNotPrimitive(newTarget);

//       membrane.enterContext(objectName);
//       constructorResult = Reflect.construct(obj, argumentsList, newTarget);
//       membrane.exitContext();

//       result = membrane.processGetValue(constructorResult, String(objectName), callerContext, calleeContext);
//       return result;
//     },
//   });

//   return wrappedObj;
// }

// membrane.contextifyFunctioncall = function(functionCall, context) {
//   return functionCall + "@" + context;
// } 

// membrane.create = function(target, moduleName="defaultModuleName", modulePermissions={}) {
//   var wrappedTarget;

//   if (membrane.isProxy(target)) return target;

//   if (target instanceof membrane.specialFunctions.ArrayBuffer)  { 
//     return target; 
//   }

//   // wrappedTarget = membrane.getWrapped(target);
//   // if (wrappedTarget) return wrappedTarget;

//   wrappedTarget = membrane.wrap(target, moduleName);

//   membrane.permissions.set(moduleName, modulePermissions);
//   membrane.mapWrapped2Unwrapped.set(wrappedTarget, target);
//   membrane.mapUnwrapped2Wrapped.set(target, wrappedTarget);

//   return wrappedTarget;
// }

// membrane.setupWhiteList = function() {
//   //We whitelist only built-in prototype functions and some built-in functions from 'window'
//   var whiteListedObject; 
//   Object.keys(whitelist).forEach(function(e1) {       
//     whiteListedObject = eval(e1);     
//     if (typeof whitelist[e1] === "object") {
//       Object.keys(whitelist[e1]).forEach(function(e2) {
//         try {
//           whiteListedObject = eval(e1 + "." + e2);
//         }
//         catch(ex) { console.log("[DEBUG] setupWhiteList catch(ex): " + e1 + " " + e2); }
//         if (e2 !== "prototype") {
//           if (whitelist[e1][e2]) {               
//             try {
//               membrane.whiteList.set(whiteListedObject, {});
//             } catch(ee) { console.log("[DEBUG] setupWhiteList catch(ee1): " + e1 + " " + e2); }
//           }             
//         }           
//         if (typeof whitelist[e1][e2] === "object") {
//           Object.keys(whitelist[e1][e2]).forEach(function(e3) {               
//             whiteListedObject = eval(e1 + "." + e2 + "." + e3);
//             if (whitelist[e1][e2][e3]) {                 
//               try {
//                 membrane.whiteList.set(whiteListedObject, {});
//               } catch(ee) { console.log("[DEBUG] setupWhiteList catch(ee2): " + e1 + " " + e2 + " " + e3); }
//             }
//           });
//         }
//       });
//     }     
//   }); 
// }

// membrane.setupBuiltinFunctions = function() {
//   // used to handle special cases of apply/construct trap
//   Object.keys(membrane.specialFunctions).forEach(function(k) {
//     membrane.specialFunctionsMap.set(membrane.specialFunctions[k], k);
//   });

//   var object = Function.prototype;     
//   ["toString"].forEach(function(name) {
//     // reuse desc to avoid reiterating prop attributes
//     var desc = membrane.original.getOwnPropertyDescriptor(object, name);
//     var existingMethod = desc.value;   
//     if (typeof existingMethod === "function") { 
//       desc.value = membrane.create(existingMethod, "global(built-in).toString");
//       membrane.original.defineProperty(object, name, desc);
//       membrane.whiteList.set(object[name], {});
//     }      
//   });
// }

// membrane.setupWhiteList();
// membrane.setupBuiltinFunctions();

// --------------------------------------------------------------------------
// --------------------------------------------------------------------------
// --------------------------------------------------------------------------

// If obj.hasOwnProperty has been overridden, then calling
// obj.hasOwnProperty(prop) will break.
// See: https://github.com/joyent/node/issues/1707
function hasOwnProperty(obj, prop) {
  return Object.prototype.hasOwnProperty.call(obj, prop);
}

function stat(filename) {
  filename = path._makeLong(filename);
  const cache = stat.cache;
  if (cache !== null) {
    const result = cache.get(filename);
    if (result !== undefined) return result;
  }
  const result = internalModuleStat(filename);
  if (cache !== null) cache.set(filename, result);
  return result;
}
stat.cache = null;


function Module(id, parent) {
  this.id = id;
  this.exports = {};
  this.parent = parent;
  if (parent && parent.children) {
    parent.children.push(this);
  }

  this.filename = null;
  this.loaded = false;
  this.children = [];
}
module.exports = Module;

Module._cache = {};
Module._pathCache = {};
Module._extensions = {};
var modulePaths = [];
Module.globalPaths = [];

// *** ORIGINAL WRAPPER
Module.wrapper = NativeModule.wrapper;
Module.wrap = NativeModule.wrap;

// *** MODIFIED WRAPPER
// Module.wrapper = [
//     '(function (exports, require, module, __filename, __dirname, global, eval) { ',
//     '\n});'
// ];
// Module.wrap = function(script) {
//     return Module.wrapper[0] + script + Module.wrapper[1];
// };

// *** MODIFIED WRAPPER ('strict' test)
// Module.wrapper = [
//     '(function (exports, require, module, __filename, __dirname, global, Function) { \'use strict\';',
//     '\n});'
// ];
// Module.wrap = function(script) {
//     return Module.wrapper[0] + script + Module.wrapper[1];
// };


Module._debug = util.debuglog('module');

// We use this alias for the preprocessor that filters it out
const debug = Module._debug;


// given a module name, and a list of paths to test, returns the first
// matching file in the following precedence.
//
// require("a.<ext>")–
//   -> a.<ext>
//
// require("a")
//   -> a
//   -> a.<ext>
//   -> a/index.<ext>

// check if the directory is a package.json dir
const packageMainCache = {};

function readPackage(requestPath) {
  if (hasOwnProperty(packageMainCache, requestPath)) {
    return packageMainCache[requestPath];
  }

  const jsonPath = path.resolve(requestPath, 'package.json');
  const json = internalModuleReadFile(path._makeLong(jsonPath));

  if (json === undefined) {
    return false;
  }

  try {
    var pkg = packageMainCache[requestPath] = JSON.parse(json).main;
  } catch (e) {
    e.path = jsonPath;
    e.message = 'Error parsing ' + jsonPath + ': ' + e.message;
    throw e;
  }
  return pkg;
}

function tryPackage(requestPath, exts, isMain) {
  var pkg = readPackage(requestPath);

  if (!pkg) return false;

  var filename = path.resolve(requestPath, pkg);
  return tryFile(filename, isMain) ||
         tryExtensions(filename, exts, isMain) ||
         tryExtensions(path.resolve(filename, 'index'), exts, isMain);
}

// In order to minimize unnecessary lstat() calls,
// this cache is a list of known-real paths.
// Set to an empty Map to reset.
const realpathCache = new Map();

const realpathCacheKey = fs.realpathCacheKey;
delete fs.realpathCacheKey;

// check if the file exists and is not a directory
// if using --preserve-symlinks and isMain is false,
// keep symlinks intact, otherwise resolve to the
// absolute realpath.
function tryFile(requestPath, isMain) {
  const rc = stat(requestPath);
  if (preserveSymlinks && !isMain) {
    return rc === 0 && path.resolve(requestPath);
  }
  return rc === 0 && toRealPath(requestPath);
}

function toRealPath(requestPath) {
  return fs.realpathSync(requestPath, {
    [realpathCacheKey]: realpathCache
  });
}

// given a path check a the file exists with any of the set extensions
function tryExtensions(p, exts, isMain) {
  for (var i = 0; i < exts.length; i++) {
    const filename = tryFile(p + exts[i], isMain);

    if (filename) {
      return filename;
    }
  }
  return false;
}

var warned = false;
Module._findPath = function(request, paths, isMain) {
  if (path.isAbsolute(request)) {
    paths = [''];
  } else if (!paths || paths.length === 0) {
    return false;
  }

  const cacheKey = JSON.stringify({request: request, paths: paths});
  if (Module._pathCache[cacheKey]) {
    return Module._pathCache[cacheKey];
  }

  var exts;
  const trailingSlash = request.length > 0 &&
                        request.charCodeAt(request.length - 1) === 47/*/*/;

  // For each path
  for (var i = 0; i < paths.length; i++) {
    // Don't search further if path doesn't exist
    const curPath = paths[i];
    if (curPath && stat(curPath) < 1) continue;
    var basePath = path.resolve(curPath, request);
    var filename;

    const rc = stat(basePath);
    if (!trailingSlash) {
      if (rc === 0) {  // File.
        if (preserveSymlinks && !isMain) {
          filename = path.resolve(basePath);
        } else {
          filename = toRealPath(basePath);
        }
      } else if (rc === 1) {  // Directory.
        if (exts === undefined)
          exts = Object.keys(Module._extensions);
        filename = tryPackage(basePath, exts, isMain);
      }

      if (!filename) {
        // try it with each of the extensions
        if (exts === undefined)
          exts = Object.keys(Module._extensions);
        filename = tryExtensions(basePath, exts, isMain);
      }
    }

    if (!filename && rc === 1) {  // Directory.
      if (exts === undefined)
        exts = Object.keys(Module._extensions);
      filename = tryPackage(basePath, exts, isMain);
    }

    if (!filename && rc === 1) {  // Directory.
      // try it with each of the extensions at "index"
      if (exts === undefined)
        exts = Object.keys(Module._extensions);
      filename = tryExtensions(path.resolve(basePath, 'index'), exts, isMain);
    }

    if (filename) {
      // Warn once if '.' resolved outside the module dir
      if (request === '.' && i > 0) {
        if (!warned) {
          warned = true;
          process.emitWarning(
            'warning: require(\'.\') resolved outside the package ' +
            'directory. This functionality is deprecated and will be removed ' +
            'soon.',
            'DeprecationWarning');
        }
      }

      Module._pathCache[cacheKey] = filename;
      return filename;
    }
  }
  return false;
};

// 'node_modules' character codes reversed
var nmChars = [ 115, 101, 108, 117, 100, 111, 109, 95, 101, 100, 111, 110 ];
var nmLen = nmChars.length;
if (process.platform === 'win32') {
  // 'from' is the __dirname of the module.
  Module._nodeModulePaths = function(from) {
    // guarantee that 'from' is absolute.
    from = path.resolve(from);

    // note: this approach *only* works when the path is guaranteed
    // to be absolute.  Doing a fully-edge-case-correct path.split
    // that works on both Windows and Posix is non-trivial.

    // return root node_modules when path is 'D:\\'.
    // path.resolve will make sure from.length >=3 in Windows.
    if (from.charCodeAt(from.length - 1) === 92/*\*/ &&
        from.charCodeAt(from.length - 2) === 58/*:*/)
      return [from + 'node_modules'];

    const paths = [];
    var p = 0;
    var last = from.length;
    for (var i = from.length - 1; i >= 0; --i) {
      const code = from.charCodeAt(i);
      // The path segment separator check ('\' and '/') was used to get
      // node_modules path for every path segment.
      // Use colon as an extra condition since we can get node_modules
      // path for dirver root like 'C:\node_modules' and don't need to
      // parse driver name.
      if (code === 92/*\*/ || code === 47/*/*/ || code === 58/*:*/) {
        if (p !== nmLen)
          paths.push(from.slice(0, last) + '\\node_modules');
        last = i;
        p = 0;
      } else if (p !== -1) {
        if (nmChars[p] === code) {
          ++p;
        } else {
          p = -1;
        }
      }
    }

    return paths;
  };
} else { // posix
  // 'from' is the __dirname of the module.
  Module._nodeModulePaths = function(from) {
    // guarantee that 'from' is absolute.
    from = path.resolve(from);
    // Return early not only to avoid unnecessary work, but to *avoid* returning
    // an array of two items for a root: [ '//node_modules', '/node_modules' ]
    if (from === '/')
      return ['/node_modules'];

    // note: this approach *only* works when the path is guaranteed
    // to be absolute.  Doing a fully-edge-case-correct path.split
    // that works on both Windows and Posix is non-trivial.
    const paths = [];
    var p = 0;
    var last = from.length;
    for (var i = from.length - 1; i >= 0; --i) {
      const code = from.charCodeAt(i);
      if (code === 47/*/*/) {
        if (p !== nmLen)
          paths.push(from.slice(0, last) + '/node_modules');
        last = i;
        p = 0;
      } else if (p !== -1) {
        if (nmChars[p] === code) {
          ++p;
        } else {
          p = -1;
        }
      }
    }

    // Append /node_modules to handle root paths.
    paths.push('/node_modules');

    return paths;
  };
}


// 'index.' character codes
var indexChars = [ 105, 110, 100, 101, 120, 46 ];
var indexLen = indexChars.length;
Module._resolveLookupPaths = function(request, parent) {
  if (NativeModule.nonInternalExists(request)) {
    return [request, []];
  }

  var reqLen = request.length;
  // Check for relative path
  if (reqLen < 2 ||
      request.charCodeAt(0) !== 46/*.*/ ||
      (request.charCodeAt(1) !== 46/*.*/ &&
       request.charCodeAt(1) !== 47/*/*/)) {
    var paths = modulePaths;
    if (parent) {
      if (!parent.paths)
        paths = parent.paths = [];
      else
        paths = parent.paths.concat(paths);
    }

    // Maintain backwards compat with certain broken uses of require('.')
    // by putting the module's directory in front of the lookup paths.
    if (request === '.') {
      if (parent && parent.filename) {
        paths.unshift(path.dirname(parent.filename));
      } else {
        paths.unshift(path.resolve(request));
      }
    }

    return [request, paths];
  }

  // with --eval, parent.id is not set and parent.filename is null
  if (!parent || !parent.id || !parent.filename) {
    // make require('./path/to/foo') work - normally the path is taken
    // from realpath(__filename) but with eval there is no filename
    var mainPaths = ['.'].concat(Module._nodeModulePaths('.'), modulePaths);
    return [request, mainPaths];
  }

  // Is the parent an index module?
  // We can assume the parent has a valid extension,
  // as it already has been accepted as a module.
  const base = path.basename(parent.filename);
  var parentIdPath;
  if (base.length > indexLen) {
    var i = 0;
    for (; i < indexLen; ++i) {
      if (indexChars[i] !== base.charCodeAt(i))
        break;
    }
    if (i === indexLen) {
      // We matched 'index.', let's validate the rest
      for (; i < base.length; ++i) {
        const code = base.charCodeAt(i);
        if (code !== 95/*_*/ &&
            (code < 48/*0*/ || code > 57/*9*/) &&
            (code < 65/*A*/ || code > 90/*Z*/) &&
            (code < 97/*a*/ || code > 122/*z*/))
          break;
      }
      if (i === base.length) {
        // Is an index module
        parentIdPath = parent.id;
      } else {
        // Not an index module
        parentIdPath = path.dirname(parent.id);
      }
    } else {
      // Not an index module
      parentIdPath = path.dirname(parent.id);
    }
  } else {
    // Not an index module
    parentIdPath = path.dirname(parent.id);
  }
  var id = path.resolve(parentIdPath, request);

  // make sure require('./path') and require('path') get distinct ids, even
  // when called from the toplevel js file
  if (parentIdPath === '.' && id.indexOf('/') === -1) {
    id = './' + id;
  }

  debug('RELATIVE: requested: %s set ID to: %s from %s', request, id,
        parent.id);

  return [id, [path.dirname(parent.filename)]];
};


// Check the cache for the requested file.
// 1. If a module already exists in the cache: return its exports object.
// 2. If the module is native: call `NativeModule.require()` with the
//    filename and return the result.
// 3. Otherwise, create a new module for the file and save it to the cache.
//    Then have it load  the file contents before returning its exports
//    object.
Module._load = function(request, parent, isMain) {
  if (parent) {
    debug('Module._load REQUEST %s parent: %s', request, parent.id);
  }

  var filename = Module._resolveFilename(request, parent, isMain);

  var cachedModule = Module._cache[filename];
  if (cachedModule) {
    return cachedModule.exports;
  }

  if (NativeModule.nonInternalExists(filename)) {
    debug('load native module %s', request);
    return NativeModule.require(filename);
  }

  var module = new Module(filename, parent);

  if (isMain) {
    process.mainModule = module;
    module.id = '.';
  }

  Module._cache[filename] = module;

  tryModuleLoad(module, filename);

  return module.exports;
};

function tryModuleLoad(module, filename) {
  var threw = true;
  try {
    module.load(filename);
    threw = false;
  } finally {
    if (threw) {
      delete Module._cache[filename];
    }
  }
}

Module._resolveFilename = function(request, parent, isMain) {
  if (NativeModule.nonInternalExists(request)) {    
    return request;
  }

  var resolvedModule = Module._resolveLookupPaths(request, parent);
  var id = resolvedModule[0];
  var paths = resolvedModule[1];

  // look up the filename first, since that's the cache key.
  // debug('looking for %j in %j', id, paths);
  // console.log('looking for %j in %j', id, paths);

  var filename = Module._findPath(request, paths, isMain);
  // console.log('request: '+ request);

  if (!filename) {
    var err = new Error("Cannot find module '" + request + "'");
    err.code = 'MODULE_NOT_FOUND';
    throw err;
  }

  // -------------------------- MEMBRANE -----------------------------------
  // console.log(">>> Loading module from path: " + filename); 
  // console.log(">>> Loading package.json for: " + filename);
  // var manifestFile = path.dirname(filename) + "/package.json";

  // if (fs.existsSync(manifestFile)) {
  //   var manifestSource = fs.readFileSync(manifestFile, 'utf-8');
  //   manifestSource = internalModule.stripBOM(manifestSource.replace(/^#!.*/, ''));
  //   var manifestJSON = JSON.parse(manifestSource);

  //   // console.log(">>> Main file.. (as defined in package.json file): " + manifestJSON.main);
  //   // console.log(">>> Permissions: ");
  //   // console.log(manifestJSON.permissions);

  //   if (manifestJSON.permissions) {
  //     var dependenciesKeys = Object.keys(manifestJSON.permissions);
  //     for (var i = 0; i < dependenciesKeys.length; i++) {
  //       moduleDependenciesPermissions[dependenciesKeys[i]] = manifestJSON.permissions[dependenciesKeys[i]];
  //     }
  //   }
  // } else {
  //   // console.log(">>> The manifest file for the " + filename + " file does not exist");
  // }
  // -------------------------- MEMBRANE -----------------------------------

  return filename;
};


// Given a file name, pass it to the proper extension handler.
Module.prototype.load = function(filename) {
  debug('load %j for module %j', filename, this.id);

  assert(!this.loaded);
  this.filename = filename;
  this.paths = Module._nodeModulePaths(path.dirname(filename));

  var extension = path.extname(filename) || '.js';
  if (!Module._extensions[extension]) extension = '.js';
  Module._extensions[extension](this, filename);
  this.loaded = true;
};


// Loads a module at the given file path. Returns that module's
// `exports` property.
Module.prototype.require = function(path) {
  assert(path, 'missing path');
  assert(typeof path === 'string', 'path must be a string');
  var module = Module._load(path, this, /* isMain */ false);

  // ------------------------- MEMBRANE ---------------------------------
  // modules with native bindings to C code throw TypeError when executed through a proxy
  // var isModuleWhiteListed = false;
  // var whiteList = [ 'os' ];
  // whiteList.forEach(function(elem) {
  //   if (path == elem) {
  //     isModuleWhiteListed = true;
  //     return;
  //   }
  // });

  // // console.log("[DEBUG] Requiring module:  " + path);
  // // if module is not whitelisted or if it is a native module
  // if (isModuleWhiteListed) {
  //   // console.log("[DEBUG] Returning unwrapped module:  " + path);
  //   return module;
  // } else {
  //   // console.log("[MEMBRANE] LOAD-MODULE <" + path + ">");
  //   // console.log("[DEBUG] Loading module:  " + path);
  //   var wrappedModule = membrane.create(module, path);
  //   return wrappedModule;
  // }
  // ------------------------- MEMBRANE ---------------------------------

  return module;
};


// Resolved path to process.argv[1] will be lazily placed here
// (needed for setting breakpoint when called with --debug-brk)
var resolvedArgv;


// Run the file contents in the correct scope or sandbox. Expose
// the correct helper variables (require, module, exports) to
// the file.
// Returns exception, if any.
Module.prototype._compile = function(content, filename) {
  // Remove shebang
  var contLen = content.length;
  if (contLen >= 2) {
    if (content.charCodeAt(0) === 35/*#*/ &&
        content.charCodeAt(1) === 33/*!*/) {
      if (contLen === 2) {
        // Exact match
        content = '';
      } else {
        // Find end of shebang line and slice it off
        var i = 2;
        for (; i < contLen; ++i) {
          var code = content.charCodeAt(i);
          if (code === 10/*\n*/ || code === 13/*\r*/)
            break;
        }
        if (i === contLen)
          content = '';
        else {
          // Note that this actually includes the newline character(s) in the
          // new output. This duplicates the behavior of the regular expression
          // that was previously used to replace the shebang line
          content = content.slice(i);
        }
      }
    }
  }

  // -------------------------- SET NEW CONTEXT ------------------------------
  // var sourceModule = Module.convertFileNameToModule(path.dirname(filename));
  // console.log(">>> FILENAME: " + path.dirname(filename));
  // var gglobal = membrane.create(global, "global");
  // var gglobal = Module.wrapGlobal(global, "global", path.dirname(filename), filename);
  // var gglobal = global;
  // var sandbox = { global: gglobal };
  // var gglobal = {};

  // create wrapper function
  // var wrapper = Module.wrap(content);
  // var sandbox = { global: gglobal, require: require, console: console }; 
  // var compiledWrapper = vm.runInSameContext(wrapper, gglobal);
  // var compiledWrapper = vm.runInProxiedContext(wrapper, gglobal);
  // var compiledWrapper = vm.runInNewContext(wrapper, sandbox);
  //--------------------------------------------------------------------------

  // var wrapper = Module.wrap(content);
  // var compiledWrapper = vm.runInProxiedContext(wrapper, {
  //   filename: filename,
  //   lineOffset: 0,
  //   displayErrors: true
  // });

  var wrapper = Module.wrap(content);
  var compiledWrapper = vm.runInThisContext(wrapper, {
    filename: filename,
    lineOffset: 0,
    displayErrors: true
  });

  if (process._debugWaitConnect) {
    if (!resolvedArgv) {
      // we enter the repl if we're not given a filename argument.
      if (process.argv[1]) {
        resolvedArgv = Module._resolveFilename(process.argv[1], null);
      } else {
        resolvedArgv = 'repl';
      }
    }

    // Set breakpoint on module start
    if (filename === resolvedArgv) {
      delete process._debugWaitConnect;
      const Debug = vm.runInDebugContext('Debug');
      Debug.setBreakPoint(compiledWrapper, 0, 0);
    }
  }
  var dirname = path.dirname(filename);
  var require = internalModule.makeRequireFunction.call(this);

  // --------------------------------------------------------------------------
  var sourceModule = Module.convertFileNameToModule(dirname);

  // replace 'require' function with 'require' with permissions checking
  var newRequire = Module.wrapRequire(require, "require", sourceModule, dirname);
 
  // var newEval = eval;
  // var newEval = Module.returnNewEval(dirname);
  // newEval.toString = function() { return '[Function: eval]' };

  // var newFunction = Function;
  // var newFunction = function(str) { 
  //   var sourceModule = Module.convertFileNameToModule(dirname);
  //   var dirnameArray = dirname.split("/");
  //   var sourceModulePermRootDir = "";

  //   if (sourceModule !== '(node-application)') {
  //     sourceModulePermRootDir = dirnameArray.slice(0, dirnameArray.indexOf(sourceModule)+1).join("/");
  //   } else {
  //     sourceModulePermRootDir = dirname;
  //   }

  //   if (!Module.checkPermission(sourceModule, "eval", sourceModulePermRootDir)) {
  //     console.log("*** [PERM-ERROR] Module " + sourceModule + " does not have permission to access " + "eval");
  //   }
  //   return global.Function(str); 
  // };
  // var newFunction = Module.wrapFunction(Function, "Function", sourceModule, dirname);
  // newFunction.toString = function() { return '[Function: Function]' };

  // var newGlobal = Module.wrapGlobal(global, "global", sourceModule);
  // newGlobal.eval = newEval;
  // var newGlobal = Module.wrapGlobal(global, "global", path.dirname(filename), filename);
  // var newGlobal = membrane.create(eval, "eval-" + sourceModule);
  // var newGlobal = global;

  // --------------------------------------------------------------------------

  // var args = [this.exports, require, this, filename, dirname, newGlobal, newEval];
  var args = [this.exports, newRequire, this, filename, dirname];
  var depth = internalModule.requireDepth;
  if (depth === 0) stat.cache = new Map();
  var result = compiledWrapper.apply(this.exports, args);
  if (depth === 0) stat.cache = null;
  return result;
};

// --------------------------------------------------------------------------
// --------------------------------------------------------------------------
// extended require function with permission checking
Module.returnNewEval = function(dirname) {
  return function(str) { 
      var sourceModule = Module.convertFileNameToModule(dirname);
      var dirnameArray = dirname.split("/");
      var sourceModulePermRootDir = "";

      if (sourceModule !== '(node-application)') {
        sourceModulePermRootDir = dirnameArray.slice(0, dirnameArray.indexOf(sourceModule)+1).join("/");
      } else {
        sourceModulePermRootDir = dirname;
      }

      if (!Module.checkPermission(sourceModule, "eval", sourceModulePermRootDir)) {
        console.log("*** [PERM-ERROR] Module " + sourceModule + " does not have permission to access " + "eval");
      }
      console.log("*** eval used by " + sourceModule);
      return eval(str); 
  }
}

Module.wrapGlobal = function(globalRef, resource, origin) {
  var handler = {
    get: function(obj, prop) {
      console.log(resource + ": " + origin + " ACCESS-PROP " + String(prop));
      return obj[prop];
    }
    // ,
    // set: function(target, prop, value, receiver) {
    //   console.log(resource + ": " + origin + " SET-PROP " + String(prop));
    //   return Reflect.set(target, prop, value, receiver);
    // }
  };
  return new Proxy(globalRef, handler);
};

Module.wrapRequire = function(require, resource, origin, dirname) {
  var handler = {
    get: function(obj, prop) {
      var sourceModule = Module.convertFileNameToModule(dirname);
      // console.log(resource + ": " + sourceModule + " ACCESS-PROP " + String(prop));
      return obj[prop];
    },
    apply: function(target, that, args) {
      var sourceModule = origin;
      var targetModule = args[0];
      if (targetModule.startsWith("./")) {
        targetModule = sourceModule;
      }
      
      // console.log(resource + ": " + sourceModule + " LOAD-MODULE " + targetModule);
      if (sourceModule !== targetModule && Module.isCoreLib(targetModule)) {

        var sourceModulePermRootDir = dirname;
        // handles case where a script is passed as argument (argv[1])
        if (sourceModule !== "(node-application)") {
          var dirnameArray = dirname.split("/");
          sourceModulePermRootDir = dirnameArray.slice(0, dirnameArray.indexOf(sourceModule)+1).join("/");
        }
        // console.log("Loading permissions for module: " + sourceModule + " (dir: " + sourceModulePermRootDir + ")");
        if (!Module.checkPermission(sourceModule, targetModule, sourceModulePermRootDir)) {
          console.log("*** [PERM-ERROR] Module " + sourceModule + " does not have permission to access " + targetModule);
        } 
      }
      return target.apply(that, args);
    }
  };
  return new Proxy(require, handler);
};

Module.loadPermissions = function(sourceModuleRootDir) {
  var sourceModulePermFile = sourceModuleRootDir + "/permissions.txt"
  var sourceModulePermissions = [];
  try {

    sourceModulePermissions = fs.readFileSync(sourceModulePermFile).toString().split("\n");
    } catch(error) {
     console.log("*** [PERM-ERROR] No permission file: " + sourceModulePermFile);
  }
  return sourceModulePermissions;
};

Module.checkPermission = function(sourceModule, targetModule, sourceModuleRootDir) {
  var hasPermissions = false;
  var noPermissionMessage = "*** [PERM-ERROR] Module " + sourceModule + " does not have permission to require module " + targetModule;

  if (sourceModuleRootDir == undefined || sourceModuleRootDir == "") sourceModuleRootDir = ".";
  var sourceModulePermissions = Module.loadPermissions(sourceModuleRootDir);
  if (targetModule != undefined && Array.isArray(sourceModulePermissions)) {
    return sourceModulePermissions.includes(targetModule);
  }
};

Module.convertFileNameToModule = function(filename, rootDir="") {
  var module = "(node-application)";
 
  if (filename != undefined && rootDir != undefined) {
    filename = filename.replace(rootDir, "");
    var fileStringArray = filename.split("/");

    if (filename.includes("node_modules")) {
      module = fileStringArray[fileStringArray.indexOf('node_modules')+1];
    }  
  }
  return module;
};

Module.isCoreLib = function(moduleName) {
 var coreLibs =  ['assert', 'buffer', 'child_process', 'cluster',
  'crypto', 'dgram', 'dns', 'domain', 'events', 'fs', 'http', 'https', 'net',
  'os', 'path', 'punycode', 'querystring', 'readline', 'repl', 'stream',
  'string_decoder', 'tls', 'tty', 'url', 'util', 'v8', 'vm', 'zlib'];

  return coreLibs.includes(moduleName);
};
// --------------------------------------------------------------------------
// --------------------------------------------------------------------------

// Native extension for .js
Module._extensions['.js'] = function(module, filename) {
  var content = fs.readFileSync(filename, 'utf8');
  module._compile(internalModule.stripBOM(content), filename);
};


// Native extension for .json
Module._extensions['.json'] = function(module, filename) {
  var content = fs.readFileSync(filename, 'utf8');
  try {
    module.exports = JSON.parse(internalModule.stripBOM(content));
  } catch (err) {
    err.message = filename + ': ' + err.message;
    throw err;
  }
};


//Native extension for .node
Module._extensions['.node'] = function(module, filename) {
  return process.dlopen(module, path._makeLong(filename));
};


// bootstrap main module.
Module.runMain = function() {
  // Load the main module--the command line argument.
  Module._load(process.argv[1], null, true);
  // Handle any nextTicks added in the first tick of the program
  process._tickCallback();
};

Module._initPaths = function() {
  const isWindows = process.platform === 'win32';

  var homeDir;
  if (isWindows) {
    homeDir = process.env.USERPROFILE;
  } else {
    homeDir = process.env.HOME;
  }

  var paths = [path.resolve(process.execPath, '..', '..', 'lib', 'node')];

  if (homeDir) {
    paths.unshift(path.resolve(homeDir, '.node_libraries'));
    paths.unshift(path.resolve(homeDir, '.node_modules'));
  }

  var nodePath = process.env['NODE_PATH'];
  if (nodePath) {
    paths = nodePath.split(path.delimiter).filter(function(path) {
      return !!path;
    }).concat(paths);
  }

  modulePaths = paths;

  // clone as a shallow copy, for introspection.
  Module.globalPaths = modulePaths.slice(0);
};

Module._preloadModules = function(requests) {
  if (!Array.isArray(requests))
    return;

  // Preloaded modules have a dummy parent module which is deemed to exist
  // in the current working directory. This seeds the search path for
  // preloaded modules.
  var parent = new Module('internal/preload', null);
  try {
    parent.paths = Module._nodeModulePaths(process.cwd());
  } catch (e) {
    if (e.code !== 'ENOENT') {
      throw e;
    }
  }
  requests.forEach(function(request) {
    parent.require(request);
  });
};

Module._initPaths();

// backwards compatibility
Module.Module = Module;
