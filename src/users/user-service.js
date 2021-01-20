const bcrypt = require('bcrypt')
const logger = require('../logger')

const UserService = {
    checkUpdatedFields(user) {
        const numberOfValues = Object.values(user).filter(Boolean).length
            if (numberOfValues === 0) {
              logger.error(`Invalid update without required fields`)
              return res.status(400).json({
                error: {
                  message: `Request body must contain either email or password`
                }
              })
            }
    },

    getById(knex, userId) {
        return knex.from('users').select('*').where('id', userId).first();
    },
    findByEmail(knex, email) {
        return knex.from('users').select('*').where('email', email).first();
    },
    insertUser(knex, newUser) {
        return knex
        .insert(newUser)
        .into('users')
        .returning('*')
        .then( rows => {
            return rows[0]
        })
    },
    deleteUser(knex, id) {
        return knex('users')
        .where({ id })
        .delete()
    },
    updateUser(knex, id, updatedUserInfo) {
        return knex('users')
            .where({ id })
            .update(updatedUserInfo)
    },
    getSavedRecipes(knex, user_id) {
        return knex('saved_recipes').select('*').where({ user_id })
            .then(res => res.map(r => r.recipe_id))
    },
    //I need to check if the entry already exists and then insert if it doesn't
    saveRecipe(knex, entry) {
        return knex.raw(`INSERT INTO saved_recipes (user_id, recipe_id) VALUES (${entry.user_id}, ${entry.recipe_id}) ON CONFLICT DO NOTHING`)
    },
    deleteSavedRecipe(knex, user_id, recipe_id) {
        return knex('saved_recipes')
            .where({ user_id })
            .where({ recipe_id})
            .delete()
    }
}

module.exports = UserService;
