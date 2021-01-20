const knex = require('knex');
const fixtures = require('./users-fixtures.js');
const app = require('../src/app');
const expect = require('chai').expect;
const { generateToken } = require('../src/auth-middleware')

const newUser = {
    email: 'test-user@email.com',
    password: 'testPassword1'
}

const updatedEmail = {
    email: 'updated-test@email.com',
    password: 'updatedTest1'
}

const fakeUser = {
    email: 'fake-user@email.com',
    password: 'fakePassword1'
}

let token;

describe('Users endpoints', () => {
    let db;
    before('make knex instance', () => {
        db = knex({
            client: 'pg',
            connection: process.env.TEST_DATABASE_URL,
        })
        app.set('db', db)
    })

    after('disconnect from db', () => db.destroy())

    before('cleanup', () => db('users').truncate())

    //afterEach('cleanup', () => db('users').truncate())

    describe('POST /users/signup', () => {
        it('Creates a new user', ()=> {
            return supertest(app)
                .post('/api/users/signup')
                .send(newUser)
                //Change this if the token feature changes
                .then((res) => {
                    expect(res.body.user.email).to.equal(newUser.email)
                    expect(res.body).to.have.property('token')
                    expect(res.body.token).to.not.equal(null)
                    token = res.body.token
                    console.log(token);
                })
                .catch( (err) => {
                    throw err;
                })
        })
    })

    describe('POST /users/login', () => {
        before('Create test user', () => {
            db('users').insert(newUser)
        })
        context('Given correct user information', () => {
            it('Successfully logins in', ()=> {
                return supertest(app)
                    .post('/api/users/login')
                    .send(newUser)
                    .expect(201)
                    .expect( (res) => {
                        expect(res.body.user.email).to.equal(newUser.email)
                        expect(res.body.user).to.have.property('id')
                        expect(res.body).to.have.property('token')
                        expect(res.body.token).to.not.equal(null)
                    })
            })
        })

        context('Given bad user information', () => {
            it('Fails to log info', ()=> {
                return supertest(app)
                    .post('/api/users/login')
                    .send(fakeUser)
                    .expect(401)
            })
        })

    })
    //testing when a user updates their information
    // describe('PATCH /users/me/username', () => {
    //     before('Create test user', () => {
    //         db('users').insert(newUser)
    //     })
    //     context('Given new info in correct format', () => {
    //         it('Successfully updates user info', () => {
    //             return supertest(app)
    //                 .patch('/api/users/me')
    //                 .set('Authorization', `Bearer `)
    //                 .send(updatedUser)
    //
    //         })
    //     })
    // })



})


https://www.instacart.com/store/partner_recipe?title=Shopping+List&current_zip_code=55414&cache_key=undefined&ingredients%5B%5D=ketchup&ingredients%5B%5D=kosher%20salt
