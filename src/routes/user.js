const {Router} = require('express');
const { User } = require('../models');
const { authorize } = require('../middleware/auth');
const bcrypt = require('bcrypt');
const router = Router();

router.use(authorize);

router.get('/userprofile', async (req, res) => {
    try {
        const user = await User.findByPk(req.user.id);
        if (!user) {
            return res.redirect('/dashboard?error=User not found');
        }
        res.render('dashboard/userprofile/index', { 
            layout: 'dashboard/index',
            title: 'User Profile',
            user: user
        });
    } catch (err) {
        console.error(err);
        res.redirect('/dashboard?error=Server error');
    }
});

router.get('/editprofile', async (req, res) => {
    try {
        const user = await User.findByPk(req.user.id);
        if (!user) {
            return res.redirect('/dashboard?error=User not found');
        }
        res.render('dashboard/userprofile/edit', { 
            layout: 'dashboard/index',
            title: 'Edit Profile',
            user: user,
            success: req.query.success,
            error: req.query.error
        });
    } catch (err) {
        console.error(err);
        res.redirect('/dashboard?error=Server error');
    }
});

router.get('/changepassword', async (req, res) => {
    try {
        const user = await User.findByPk(req.user.id);
        if (!user) {
            return res.redirect('/dashboard?error=User not found');
        }
        res.render('dashboard/userprofile/changepassword', { 
            layout: 'dashboard/index',
            title: 'Change Password',
            user: user,
            success: req.query.success,
            error: req.query.error
        });
    } catch (err) {
        console.error(err);
        res.redirect('/dashboard?error=Server error');
    }
});

router.post('/changeprofile', async (req, res) => {
    const { name, email } = req.body;
    try {
        const user = await User.findByPk(req.user.id);
        if (!user) {
            return res.redirect('/dashboard/userprofile?error=User not found');
        }
        user.name = name;
        user.email = email;
        await user.save();
        res.redirect('/dashboard/userprofile?success=Profile updated successfully');
    } catch (err) {
        console.error(err);
        res.redirect('/dashboard/userprofile?error=Server error');
    }
});

router.post('/changepassword', async (req, res) => {
    const { currentPassword, newPassword, confirmPassword } = req.body;
    try {
        const user = await User.findByPk(req.user.id);
        if (!user) {
            return res.redirect('/dashboard/changepassword?error=User not found');
        }
        const isMatch = await bcrypt.compare(currentPassword, user.password);
        if (!isMatch) {
            return res.redirect('/dashboard/changepassword?error=Current password is incorrect');
        }
        if (newPassword !== confirmPassword) {
            return res.redirect('/dashboard/changepassword?error=New passwords do not match');
        }
        if (newPassword.length < 6) {
            return res.redirect('/dashboard/changepassword?error=Password must be at least 6 characters');
        }
        user.password = await bcrypt.hash(newPassword, 12);
        await user.save();
        res.redirect('/dashboard/userprofile?success=Password changed successfully');
    } catch (err) {
        console.error(err);
        res.redirect('/dashboard/changepassword?error=Server error');
    }
});

module.exports = router;