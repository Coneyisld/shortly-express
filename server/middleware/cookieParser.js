const parseCookies = (req, res, next) => {
  //console.log('request', req.headers.cookie);
  req.cookies = {};
  if (req.headers.cookie) {
    var str = req.headers.cookie;
    var arr = str.split('; ');
    var obj = {};
    //console.log('array of cookies', arr);
    for (var i = 0; i < arr.length; i++) {
      [key, value] = arr[i].split('=');
      obj[key] = value;
    }
    req.cookies = obj;
    
  }
  next();
    
};

module.exports = parseCookies;