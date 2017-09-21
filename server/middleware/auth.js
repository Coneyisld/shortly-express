const models = require('../models');
const Promise = require('bluebird');

module.exports.createSession = (req, res, next) => {
  console.log('is there a cookie:', req.cookies, "hello");
  if (!Object.keys( req.cookies ).length) {
    console.log('do nothing');
    models.Sessions.create()
    .then (sessions => {
      console.log('results', sessions);
    });
  } 
  next();
};

/************************************************************/
// Add additional authentication middleware functions below
/************************************************************/

