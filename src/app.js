const express = require('express');
const path = require('path');
const app = express();
const port = require('./config/env').app.port;
const jwt = require('jsonwebtoken');
const expressLayouts = require('express-layouts');
const bodyParser = require('body-parser');
const cors = require('cors');
const helmet = require('helmet');
const cookieParser = require('cookie-parser');
const { sequelize } = require('./models');
const { authorize } = require('./middleware/auth');

const authRoutes = require('./routes/auth');
const taskRoutes = require('./routes/task');
const userRoutes = require('./routes/user');
const dashboardRoutes = require('./routes/dashboard');

// Middleware

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static(path.join(__dirname, 'public')));


app.use(cors());
app.use(express.urlencoded({ extended: true }));
app.use(helmet({
    contentSecurityPolicy: false,   
}));
app.use(cookieParser());
app.use(express.json());
app.use(bodyParser.json());
app.use(expressLayouts);

// Sync database
sequelize.sync({ force: false, alter: true }).then(() => {
    console.log('Database synced');
}).catch(err => {
    console.error('Error syncing database:', err);
});


app.use('/', authRoutes);
app.use('/', dashboardRoutes);
app.use('/dashboard', taskRoutes);
app.use('/dashboard', userRoutes);



app.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}`);
}); 