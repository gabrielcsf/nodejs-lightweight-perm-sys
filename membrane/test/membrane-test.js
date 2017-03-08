var assert = require('assert');
var membrane = require('../membrane');

  describe('when creating a membrane around a function', function() {
    it('should transparently return a wrapped function', function() {
      var foo = function(){ return "foo"; };
      var wrappedFunc = membrane.create(foo).ref;
      assert.equal(typeof wrappedFunc, 'function');
      assert.equal(foo(), wrappedFunc());
    });
  });

  describe('when creating a membrane and revoking it', function() {
  	it('should not allow access to wrapped object or its dependencies', function() {
		var wetX = { a : 0 };
		var wetY = { x : wetX };
		var wetZ = { y : wetY };
		var membr = membrane.create(wetZ);

		var dryZ = membr.ref;
		assert.notEqual(dryZ, wetZ); // proxy object != original object

		var dryX = dryZ.y.x;
		assert.notEqual(dryX, wetX); // proxy object != original object

		membr.revoke(); 
		assert.throws(() => { console.log(dryX) }, Error);
		assert.throws(() => { console.log(dryZ) }, Error);
	});
  });



