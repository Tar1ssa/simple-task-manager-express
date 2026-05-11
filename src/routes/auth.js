const {Router} = require('express');
const { User } = require('../models');
const bcrypt = require('bcrypt');
const jwt = require('../jwt/token');
const crypto = require('crypto');
const router = Router();

router.get('/login', async (req, res) => {
    res.render('auth/login', { 
        layout: 'auth/index',
        title: 'Login',
        message: req.query.message
    });
});

router.get('/', async (req, res) => {
    res.render('auth/login', { 
        layout: 'auth/index',
        title: 'Login' 
    });
});

router.post('/login', async (req, res) => {
    const { email, password } = req.body;
    try {
        const user = await User.findOne({ where: { email } });
        if (!user || !(await bcrypt.compare(password, user.password))) {
            return res.redirect('/login?message=invalid_credentials');
        } 
        // Generate JWT token
        const token = jwt.generateToken({ id: user.id, email: user.email });
        res.cookie('token', token, { 
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production', // Set secure flag in production
            maxAge: 3600000 // 1 hour
         }); // Set token in cookie
        res.redirect('/dashboard');
    } catch (err) {
        console.error(err);
        res.redirect('/login?message=server_error');
    }
});

router.get('/register', async (req, res) => {
    res.render('auth/register', { 
        layout: 'auth/index',
        title: 'Register' 
    });
});

router.post('/register', async (req, res) => {
    const { name, email, password } = req.body;
    try {
        const existingUser = await User.findOne({ where: { email } });
        if (existingUser) {
            return res.redirect('/register?message=email_in_use');
        }
        const hashedPassword = await bcrypt.hash(password, 12); // In production, hash the password before saving
        const newUser = await User.create({ name, email, password: hashedPassword });
        // Generate JWT token
        const token = jwt.generateToken({ id: newUser.id, email: newUser.email });
        res.cookie('token', token, { 
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production', // Set secure flag in production
            maxAge: 3600000 // 1 hour
         }); // Set token in cookie
        res.redirect('/dashboard');
    } catch (err) {
        console.error(err);
        res.redirect('/register?message=server_error');
    }
});

router.get('/forgot-password', async (req, res) => {
    res.render('auth/forgot-password', { 
        layout: 'auth/index',
        title: 'Forgot Password',
        message: req.query.message,
        tokenVerified: false
    });
});

router.post('/forgot-password', async (req, res) => {
    const { email, token, newPassword, confirmPassword } = req.body;
    
    try {
        if (email && !token && !newPassword) {
            // Step 1: Generate token
            const user = await User.findOne({ where: { email } });
            if (!user) {
                return res.redirect('/forgot-password?message=user_not_found');
            }
            // Generate a password reset token send it to console log for demonstration
            const resetToken = jwt.generateToken({ id: user.id, email: user.email });
            res.redirect(`/forgot-password?message=reset_token_generated&token=${resetToken}`);
            console.log(`Password reset token for ${email}: ${resetToken}`);
        } else if (token && !newPassword) {
            // Step 2: Verify token
            const decoded = jwt.verifyToken(token);
            if (!decoded) {
                return res.redirect('/forgot-password?message=invalid_token');
            }
            const user = await User.findByPk(decoded.id);
            if (!user) {
                return res.redirect('/forgot-password?message=user_not_found');
            }
            // Token verified, show password form
            res.render('auth/forgot-password', { 
                layout: 'auth/index',
                title: 'Forgot Password',
                message: 'token_verified',
                tokenVerified: true,
                verifiedToken: token
            });
        } else if (token && newPassword) {
            // Step 3: Reset password
            const decoded = jwt.verifyToken(token);
            if (!decoded) {
                return res.redirect('/forgot-password?message=invalid_token');
            }
            const user = await User.findByPk(decoded.id);
            if (!user) {
                return res.redirect('/forgot-password?message=user_not_found');
            }
            if (newPassword !== confirmPassword) {
                return res.render('auth/forgot-password', { 
                    layout: 'auth/index',
                    title: 'Forgot Password',
                    message: 'password_mismatch',
                    tokenVerified: true,
                    verifiedToken: token
                });
            }
            if (newPassword.length < 6) {
                return res.render('auth/forgot-password', { 
                    layout: 'auth/index',
                    title: 'Forgot Password',
                    message: 'password_too_short',
                    tokenVerified: true,
                    verifiedToken: token
                });
            }
            user.password = await bcrypt.hash(newPassword, 12);
            await user.save();
            res.redirect('/login?message=password_reset_successfully');
        } else {
            res.redirect('/forgot-password?message=invalid_request');
        }
    } catch (err) {
        console.error(err);
        res.redirect('/forgot-password?message=server_error');
    }
});

router.get('/reset-password', async (req, res) => {
    res.render('auth/reset-password', { 
        layout: 'auth/index',
        title: 'Reset Password',
        message: req.query.message
    });
});

router.post('/reset-password', async (req, res) => {
    const { token, newPassword } = req.body;
    try {
        const decoded = jwt.verifyToken(token);
        if (!decoded) {
            return res.redirect('/reset-password?message=invalid_token');
        }
        const user = await User.findByPk(decoded.id);
        if (!user) {
            return res.redirect('/reset-password?message=user_not_found');
        }
        user.password = await bcrypt.hash(newPassword, 12);
        await user.save();
        res.redirect('/login?message=password_reset_successfully');
    } catch (err) {
        console.error(err);
        res.redirect('/reset-password?message=server_error');
    }
});

router.post('/logout', (req, res) => {
    try {       
        res.clearCookie('token'); 
        res.redirect('/login?message=logged_out_successfully');
    } catch (err) {
        console.error(err);
        res.redirect('/login?message=server_error');
    }
});

module.exports = router;