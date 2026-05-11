const {Router} = require('express');
const { User } = require('../models');
const { authorize } = require('../middleware/auth');
const router = Router();

router.use(authorize);

router.get('/dashboard', async (req, res) => {
    try {
        const token = req.cookies.token;
        if (!token) {
            return res.redirect('/');
        }
        const user = await User.findByPk(req.user.id);
        const tasks = await user.getTasks();
        const tasksInProgress = tasks.filter(task => task.status === 'in_progress');
        const tasksCompleted = tasks.filter(task => task.status === 'completed');
        const tasksPending = tasks.filter(task => task.status === 'pending');
        res.render('dashboard/dashboard/index', { 
            layout: 'dashboard/index',
            title: 'Dashboard',
            user: user,
            tasks: tasks,
            tasksCount: tasks.length,
            tasksInProgressCount: tasksInProgress.length,
            tasksCompletedCount: tasksCompleted.length,
            tasksPendingCount: tasksPending.length
        });
    } catch (err) {
        console.error(err);
        res.redirect('/login');
    }
});

module.exports = router;