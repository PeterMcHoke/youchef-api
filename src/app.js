require('dotenv').config();
const express = require('express');
const morgan = require('morgan');
const cors = require('cors');
const {CLIENT_ORIGIN} = require('./config');
const helmet = require('helmet');
const { NODE_ENV } = require('./config')
const userRouter = require('./users/user-router')
const recipeRouter = require('./recipes/recipe-router')
const errorHandler = require('./error-handler')
const { requireAuth } = require('./auth-middleware')
const app = express();



const morganOption = (NODE_ENV === 'production')
  ? 'tiny'
  : 'common';

app.use(morgan(morganOption));
app.use(helmet());
app.use(
    cors({
        origin: CLIENT_ORIGIN
    })
);
app.use(express.json());


app.use('/api/users', userRouter)
app.use('/api/recipes', recipeRouter)

app.get('/', (req, res)=> {
    res.json({
        "message": "Hello world"
    })
});

app.use(errorHandler)

module.exports = app;
