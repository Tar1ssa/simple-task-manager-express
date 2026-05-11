const sequelize = require('../config/database');
const User = require('./User');
const Task = require('./Task');

// Add associations here
User.hasMany(Task, { foreignKey: 'user_id' });
Task.belongsTo(User, { foreignKey: 'user_id' });

module.exports = {
    sequelize,
    User,
    Task,
};