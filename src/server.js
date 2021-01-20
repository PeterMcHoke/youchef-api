const app = require('./app');
const knex = require('knex');
const { PORT, DB_URL, NODE_ENV } = require('./config')

const db = knex({
    client: 'pg',
    connection: DB_URL
})

app.set('db', db)

app.listen(PORT, ()=> {
    if (NODE_ENV === 'development') {
        console.log(`Server listening at http://localhost:${PORT}`)
    }
})
