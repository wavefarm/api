// base32 according to http://www.crockford.com/wrmg/base32.html
var alphabet = '0123456789abcdefghjkmnpqrstvwxyz';

module.exports = function genid (length) {
  var x = length || 6;
  var id = '';
  while (x) {
    id += alphabet.charAt(Math.floor(Math.random() * alphabet.length));
    x--;
  }
  return id;
};
