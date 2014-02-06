/**
 * _getHashFromUrl
 * generate filename before saving in the filesystem,
 * using a simple hash function to run on the url.
 * The url is either the url of the image or the url of the page being captured
 *
 * Needs Unit Test
 *
 * @see http://stackoverflow.com/q/7616461/940217
 * @private
 * @param url
 * @return {number}
 */
var _getHashFromUrl = function(url) {
    if (typeof url !== 'string') {
        url = String(url);
    }
    return url.split('').reduce(function(a, b) {
        //jshint bitwise:false
        a = ((a << 5) - a) + b.charCodeAt(0);
        return a & a;
    }, 0);
};

var assert = require('assert');

it('test function with general calls', function() {
    assert.ok(_getHashFromUrl('testString'));
    assert.equal(_getHashFromUrl(''), 0);
    assert.ok(_getHashFromUrl('http://www.google.com/image.png'));
    assert.equal(_getHashFromUrl('testString'), _getHashFromUrl('testString'));
});

it('test function with challenging calls', function() {
    assert.ok(_getHashFromUrl(' '));
    assert.ok(_getHashFromUrl('http://www.really.long.string/really/really/really/really/really/really/really/really/'));
    assert.notEqual(_getHashFromUrl('hello1'), _getHashFromUrl('hello2'));
    assert.ok(_getHashFromUrl(_getHashFromUrl('hello')));
});
