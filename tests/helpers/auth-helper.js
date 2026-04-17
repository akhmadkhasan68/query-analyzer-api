'use strict';

const { api } = require('./api-client');
const { config } = require('../config');

let cachedTokens = null;

async function login(email, password) {
    const response = await api()
        .post('/api/v1/auth/basic')
        .send({
            email: email || config.auth.adminEmail,
            password: password || config.auth.adminPassword,
        });

    if (response.status !== 201) {
        throw new Error(`Login failed ${response.status}: ${JSON.stringify(response.body)}`);
    }

    const tokens = response.body.data.token;
    cachedTokens = {
        accessToken: tokens.access_token,
        refreshToken: tokens.refresh_token,
    };
    return { tokens: cachedTokens, user: response.body.data.user };
}

function getAuthHeader() {
    if (!cachedTokens) throw new Error('Call login() in beforeAll() first.');
    return { Authorization: `Bearer ${cachedTokens.accessToken}` };
}

function getRefreshHeader() {
    if (!cachedTokens) throw new Error('Call login() in beforeAll() first.');
    return { Authorization: `Bearer ${cachedTokens.refreshToken}` };
}

function getTokens() {
    return cachedTokens;
}

function clearTokens() {
    cachedTokens = null;
}

module.exports = {
    login,
    getAuthHeader,
    getRefreshHeader,
    getTokens,
    clearTokens,
};
