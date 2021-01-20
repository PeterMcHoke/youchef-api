const path = require('path')
const express = require('express')
const xss = require('xss')
const logger = require('../logger')
const bcrypt = require('bcrypt');
const UserService = require('./user-service')
const { requireAuth, generateToken } = require('../auth-middleware')
const userRouter = express.Router()
const bodyParser = express.json()
const RecipeService = require('../recipes/recipe-service')

//Sign up routes
userRouter
    .route('/signup')
    .post(bodyParser, (req, res, next) => {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(401).json(
                {
                    message: 'You must include an email and password.'
                }
            )
        }
        //encrypting the password
        const saltRounds = 10;
        const hasedPass = '';
        bcrypt.genSalt(saltRounds, function(err, salt) {
          bcrypt.hash(password, salt, function(err, hash) {
              UserService.insertUser(
                  req.app.get('db'), { email, password: hash}
              ).then(
                  (user) => {
                      res
                        .status(201)
                        .json({
                          user: {
                              email: user.email
                          },
                          token: generateToken(user.id)
                        })
                  }
              )
           });
        });
    })


//Login routes
userRouter.route('/login')
    .post(bodyParser, (req, res, next) => {
        const { email, password } = req.body;
        UserService.findByEmail(req.app.get('db'), email).then(
            (user) => {
                if (!user) {
                    res.status(401).json({
                        message: "Incorrect username or password, try again"
                    })
                }
                else {
                    bcrypt.compare(password,user.password).then((result)=>{
                      if(result){
                          res
                            .status(201)
                            .json({
                                user: {
                                    id: user.id,
                                    email: user.email
                                },
                                token: generateToken(user.id)
                            })
                      } else {
                        res.status(401).json({
                            message: 'Incorrect username or password, try again.'
                        })
                      }
                    }).catch((err) => console.error(err))
                }
        })
    })

userRouter.route('/me')
    .get(bodyParser, requireAuth, (req, res, next) => {
        const { id, email } = req.user;
        if (!id || !email)
            res.status(401).json({ message: 'Your must login to see this content'})
        return res.status(204).json({message: `ID: ${id}, Email: ${email}`})
    })
    .patch(bodyParser, requireAuth, (req, res, next) => {
        const { email } = req.body;
        if (!email )
            res.status(400).json({message: 'You must include an email'})
        const userToUpdate = { email }
        //Checks if there are any fields to be updated
        UserService.checkUpdatedFields(userToUpdate)
        UserService.updateUser(
            req.app.get('db'),
            req.user.id,
            userToUpdate
        ).then((numRowsAffected) => {
            return res.status(204).json({message: 'Update successful'})
        })
        .catch(next)
    })

const tap = (label) => (x) => {
    console.log(label, x)
    return x;
}
userRouter.route('/me/recipes')
    .get(bodyParser, requireAuth, (req, res, next) => {
        const { id } = req.user;
        console.log('id:', id)
        UserService.getSavedRecipes(req.app.get('db'), id )
            .then(tap('db'))
            .then(recipes => RecipeService.getInfoBulk(recipes))
            .then(tap('bulk'))
            .then(recipes => res.json(recipes))
            .catch(next)
    })
    .post(bodyParser, requireAuth, (req, res, next) => {
        const user_id = req.user.id;
        const recipe_id = req.body.id;
        UserService.saveRecipe(req.app.get('db'), { user_id, recipe_id })
            .then( entry => {
                res
                    .status(201)
                    .json({
                        user: entry.user_id,
                        recipe: entry.recipe_id
                    })
            })
            .catch(console.log)
    })
    .delete(bodyParser, requireAuth, (req, res, next) => {
        const user_id = req.user.id;
        const recipe_id = req.body.id;
        UserService.deleteSavedRecipe(req.app.get('db'), user_id, recipe_id)
            .then( val => {
                if (val === 1) {
                    return res
                        .status(200)
                        .json({ message: 'You successfully unsaved a recipe!'})
                }
                else 
                    console.log('Value from res in user-router' + val)
            })
            .catch(console.log)
    })



module.exports = userRouter;
