const path = require('path')
const express = require('express')
const xss = require('xss')
const logger = require('../logger')
const bodyParser = express.json()
const RecipeService = require('./recipe-service')
const { requireAuth } = require('../auth-middleware')
const recipeRouter = express.Router()



//Recipe routes
recipeRouter
    .route('/search')
    .get(bodyParser, (req, res, next) => {
        const { ingredients } = req.query;
        if (!ingredients) {
            return res.status(400).json(
                {
                    message: 'You must include at least one ingredient.'
                }
            )
        }
        const ingredientsArray = ingredients.split(',');
        RecipeService.getFullRecipes(ingredientsArray)
            .then(recipes => res.json(recipes))
            .catch(next)
    })

module.exports = recipeRouter
