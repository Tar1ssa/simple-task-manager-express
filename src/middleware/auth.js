const jwt = require('jsonwebtoken');
const config = require('../config/env');
const { verifyToken } = require('../jwt/token');
const crypto = require('crypto');



function authorize(req, res, next) {
    let token;
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
        token = authHeader.split(' ')[1];
    } else if (req.cookies && req.cookies.token) {
        token = req.cookies.token;
    }
    if (!token) {
        return res.redirect('/login?message=not_authenticated');
    }
    try {
        const decoded = verifyToken(token);
        if (!decoded) {
            return res.redirect('/login?message=invalid_token');
        }
        req.user = decoded;
        next();
    } catch (err) {
        console.error(err);
        res.redirect('/login?message=invalid_token');
    }
}

module.exports = { authorize };