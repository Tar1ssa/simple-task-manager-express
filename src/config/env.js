require('dotenv').config();
module.exports = {
    app: {
        port: process.env.APP_PORT || 3000,
    },
    jwt: {
        secret: process.env.JWT_SECRET,
    },
    database: {
        host: process.env.DB_HOST || 'localhost',
        username: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD || '',
        database: process.env.DB_NAME,
    },
};  