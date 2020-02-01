const jwt = require('jsonwebtoken')
const User = require('../models/user')

const auth = async (req, res, next) => {
    console.log('auth middleware')

    try {
        console.log('Entrou auth começo\n')
        const token = req.header('Authorization').replace('Bearer ', '')
        const decoded = jwt.verify(token, process.env.JWT_SECRET)
        const user = await User.findOne({
            _id: decoded._id,
            'tokens.token': token
        })
        if (!user) throw new Error('Authorization error')

        req.token = token
        req.user = user
        console.log('Saiu auth fim\n')
        next()
    } catch (e) {
        res.status(401).send({ error: "Please authenticate" })
    }

}

module.exports = auth
