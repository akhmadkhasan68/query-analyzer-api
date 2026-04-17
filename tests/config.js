'use strict';

require('dotenv').config();

const config = {
    app: {
        url: process.env.APP_URL || 'http://127.0.0.1:3000',
    },
    auth: {
        adminEmail: process.env.TEST_ADMIN_EMAIL || 'admin.1@admin.com',
        adminPassword: process.env.TEST_ADMIN_PASSWORD || 'password',
    },
};

module.exports = { config };
