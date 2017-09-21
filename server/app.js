const express = require('express');
const path = require('path');
const utils = require('./lib/hashUtils');
const partials = require('express-partials');
const bodyParser = require('body-parser');
const Auth = require('./middleware/auth');
const models = require('./models');
const db = require('./db');
const mysql = require('mysql');

const app = express();

app.set('views', `${__dirname}/views`);
app.set('view engine', 'ejs');
app.use(partials());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, '../public')));



app.get('/', 
(req, res) => {
  res.render('index');
  console.log('line 24');
});

app.get('/create', 
(req, res) => {
  res.render('index');
});

app.get('/links', 
(req, res, next) => {
  models.Links.getAll()
    .then(links => {
      res.status(200).send(links);
    })
    .error(error => {
      res.status(500).send(error);
    });
});

app.post('/links', 
(req, res, next) => {
  var url = req.body.url;
  if (!models.Links.isValidUrl(url)) {
    // send back a 404 if link is not valid
    return res.sendStatus(404);
  }

  return models.Links.get({ url })
    .then(link => {
      if (link) {
        throw link;
      }
      return models.Links.getUrlTitle(url);
    })
    .then(title => {
      return models.Links.create({
        url: url,
        title: title,
        baseUrl: req.headers.origin
      });
    })
    .then(results => {
      return models.Links.get({ id: results.insertId });
    })
    .then(link => {
      throw link;
    })
    .error(error => {
      res.status(500).send(error);
    })
    .catch(link => {
      res.status(200).send(link);
    });
});

/************************************************************/
// Write your authentication routes here
/************************************************************/
// app.post('/signup', (req, res, result) => {
//   console.log('hello! this is on line 82');
//   res.render('signup');
// });
app.get('/signup', 
(req, res) => {
  res.render('signup');
});

app.post('/signup', (req, res) => {
  
  var username = req.body.username;
  var pw = req.body.password;
  return models.Users.get({username})
    .then(results => {
      if (!results) {
        return models.Users.create({username: username, password: pw}) 
          .then (results => {
            res.redirect('/');
          }
        ); 
      } else {
        res.redirect('/signup');
      }
    });
  // isf (!username ) {
  //   res.render('signup');
  // } else {
  //   var queryStr = 'SELECT * FROM users WHERE username =' + username;
  //   db.query(queryStr, function(err, results) {
  //     console.log('signup account result', results);
  //     if (!results) {
  //       db.query('insert into users (username) Values (' + username + ')', function(err, results){
  //         callback(results);
  //       });
  //     }
      
  //   });
  // }
});

app.get('/login', 
(req, res) => {
  res.render('login');
});

app.post('/login', (req, res) => {
  var username = req.body.username;
  var attempted = req.body.password;
  console.log('line 133', username, attempted);
  return models.Users.get({username})
    .then(results => {
      if (!results) {
        res.redirect('/login');
      } else {

        
        var exist = models.Users.compare(req.body.password, results.password, results.salt); 
        console.log('attempted', attempted, "hello");
        console.log('password', results.password);
        console.log('salt', results.salt);
        console.log('exist', exist);
        if (exist) {
          res.redirect('/');
          
        } else {
          res.redirect('/login');
          
        }   
         
      } 
      
    });

});
/************************************************************/
// Handle the code parameter route last - if all other routes fail
// assume the route is a short code and try and handle it here.
// If the short-code doesn't exist, send the user to '/'
/************************************************************/

app.get('/:code', (req, res, next) => {

  return models.Links.get({ code: req.params.code })
    .tap(link => {

      if (!link) {
        throw new Error('Link does not exist');
      }
      return models.Clicks.create({ linkId: link.id });
    })
    .tap(link => {
      return models.Links.update(link, { visits: link.visits + 1 });
    })
    .then(({ url }) => {
      res.redirect(url);
    })
    .error(error => {
      res.status(500).send(error);
    })
    .catch(() => {
      res.redirect('/');
    });
});

module.exports = app;
