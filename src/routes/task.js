const {Router} = require('express');
const { User, Task } = require('../models');
const { authorize } = require('../middleware/auth');
const router = Router();

router.use(authorize);



router.get('/tasks', async (req, res) => {
    try {
        const user = await User.findByPk(req.user.id);
        const tasks = await Task.findAll({ where: { user_id: req.user.id } });
        res.render('dashboard/task/index', { 
            layout: 'dashboard/index', 
            title: 'Tasks', 
            tasks,
            user,
            success: req.query.success,
            error: req.query.error
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
});

router.post('/tasks/add', async (req, res) => {
    const { title, description } = req.body;
    try {
        const task = await Task.create({ title, description, user_id: req.user.id });
        res.redirect('/dashboard/tasks?success=Task created successfully');
    } catch (err) {
        console.error(err);
        res.redirect('/dashboard/tasks?error=Server error');
    }
});

router.post('/tasks/update/:id', async (req, res) => {
    const { id } = req.params;
    const { title, description, status } = req.body;
    try {
        const task = await Task.findByPk(id);
        if (!task) {
            return res.redirect('/dashboard/tasks?error=Task not found');
        }
        if (title !== undefined) task.title = title;
        if (description !== undefined) task.description = description;
        if (status !== undefined) task.status = status;
        await task.save();
        res.redirect('/dashboard/tasks?success=Task updated successfully');
    } catch (err) {
        console.error(err);
        res.redirect('/dashboard/tasks?error=Server error');
    }
});

router.post('/tasks/delete/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const task = await Task.findByPk(id);
        if (!task) {
            return res.redirect('/dashboard/tasks?error=Task not found');
        }
        await task.destroy();
        res.redirect('/dashboard/tasks?success=Task deleted successfully');
    } catch (err) {
        console.error(err);
        res.redirect('/dashboard/tasks?error=Server error');
    }
});


module.exports = router;