const UserService = require('./users/user-service')
const jwt = require('jsonwebtoken')
const JWT_OPTIONS = { algorithm: 'HS256' }

const generateToken = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET, JWT_OPTIONS);
}

const decryptToken = (token) => {
    try {
        const data = jwt.verify(token, process.env.JWT_SECRET, JWT_OPTIONS);
        return { userId: data.userId}
    }
    catch {
        return false;
    }
}

const requireAuth = (req, res, next) => {
    const authInfo = req.get('Authorization');
    if (!authInfo)
        return res.status(400).json({message: 'Missing authorization header'})

    const tokenError = { message: 'Invalid token' };
    const token = authInfo.slice('Bearer '.length);
    console.log('token:', token)
    if (!token)
        return res.status(400).json(tokenError)

    const data = decryptToken(token)
    if (!data)
        return res.status(401).json(tokenError)

    UserService.getById(req.app.get('db'), data.userId).then(
        (user) => {
            if (!user)
                return res.status(401).json(tokenError)
            req.user = user;
            next();
        }
    )
}

module.exports = { requireAuth, generateToken, decryptToken }
