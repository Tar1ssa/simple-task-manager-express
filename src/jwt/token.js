const jwt = require('jsonwebtoken');
const config = require('../config/env');



function generateToken(user) {
    const payload = {
        id: user.id,
        email: user.email
    };
    const token = jwt.sign(payload, config.jwt.secret, { expiresIn: '1h' });
    return token;
}

function verifyToken(token) {
    try {
        const decoded = jwt.verify(token, config.jwt.secret);
        return decoded;
    } catch (err) {
        console.error(err);
        return null;
    }
}

module.exports = { generateToken, verifyToken };