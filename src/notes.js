/*
users-router:

signIn => POST /users/signIn
updateEmail => PATCH /users { email: email}
updatePassword => PATCH /users/password { oldPassword, password: password }
createAccount => POST /users


-
getSavedRecipes => GET /users/:id/recipes (requires auth)
-



recipes-router:
GET /recipes?ingredients=the,ingredients,comma,separated
-


users:
id, email, password */

fetch('...', {
  method: 'POST',
  body: JSON.stringify(theData),
  headers: {
    'Content-type': 'application/json',
    'Authorization': 'Bearer theTokenKADfjadkfjADKj'
  }
});




// bcrypt => one-way encryption/hashing



const bcrypt = require('bcrypt');

// => hash

function generateToken(userId) {
  return JSON.stringify({ userId });
}

const jsonParser = express.json();

app.post('/users', jsonParser, (req, res, next) => {
  const { email, password } = req.body;
  const hashedPass = bcrypt.hashSync(password, 8);

  UsersService.insertUser(
    req.app.get('db'), { email, password: hashedPass }
  ).then(
    (user) =>
      res.json({
        user: {
          id: user.id,
          email: user.email
        },
        token: generateToken(user.id)
      })
  );
});


function comparePasswords(plainText, hash) {
  try {
    bcrypt.compareSync(plainText, hash);
    return true;
  } catch {
    return false;
  }
}


// db.into('users').insert(user, '*')

app.post('/users/signIn', jsonParser, (req, res, next) => {
  const { email, password } = req.body;

  UsersService.findByEmail(req.app.get('db'), email).then(
    (user) => {
      if (!user)
        res.send('no user');

      if (comparePasswords(password, user.password)) {
        // you are logged in, respond with { user, token } same way as above
      }

      // otherwise, error
    }
  );

});


// auth-middleware.js

function decryptToken(token) {
  return JSON.parse(token);
}

function requireAuth(req, res, next) {
  const authInfo = req.get('Authorization');
  const token = authInfo.slice('Bearer '.length);
  const data = decryptToken(token);

 // on errors, reply with 403

  UsersService.getById(req.app.get('db'), data.userId).then(
    (user) => {

      res.user = user;
      next();

    });
}



app.get('/this/requires/login', requireAuth, (req, res, next) => {
  // res.user has the user that is logged in
});
 x
