'use strict';

const { api } = require('../helpers/api-client');
const { login, getAuthHeader, getRefreshHeader, clearTokens } = require('../helpers/auth-helper');
const { config } = require('../config');

describe('Auth Scenarios', () => {
    describe('POST /api/v1/auth/basic', () => {
        it('should login successfully with valid credentials', async () => {
            const response = await api().post('/api/v1/auth/basic').send({
                email: config.auth.adminEmail,
                password: config.auth.adminPassword,
            });

            expect(response.status).toBe(201);
            expect(response.body.data).toHaveProperty('token');
            expect(response.body.data).toHaveProperty('user');
            expect(response.body.data.token).toHaveProperty('access_token');
            expect(response.body.data.token).toHaveProperty('refresh_token');
        });

        it('should fail with wrong password', async () => {
            const response = await api().post('/api/v1/auth/basic').send({
                email: config.auth.adminEmail,
                password: 'wrongpassword123!',
            });

            expect(response.status).toBe(401);
        });

        it('should fail with missing email field', async () => {
            const response = await api().post('/api/v1/auth/basic').send({
                password: config.auth.adminPassword,
            });

            expect([400, 422]).toContain(response.status);
        });

        it('should fail with unknown email', async () => {
            const response = await api().post('/api/v1/auth/basic').send({
                email: 'nonexistent@example.com',
                password: config.auth.adminPassword,
            });

            expect(response.status).toBe(401);
        });
    });

    describe('Authenticated endpoints', () => {
        beforeAll(async () => {
            await login();
        });

        describe('GET /api/v1/auth/me', () => {
            it('should return current user info with valid token', async () => {
                const response = await api().get('/api/v1/auth/me').set(getAuthHeader());

                expect(response.status).toBe(200);
                expect(response.body.data).toHaveProperty('id');
                expect(response.body.data).toHaveProperty('email');
            });

            it('should fail without token', async () => {
                const response = await api().get('/api/v1/auth/me');

                expect(response.status).toBe(401);
            });

            it('should fail with invalid token', async () => {
                const response = await api()
                    .get('/api/v1/auth/me')
                    .set({ Authorization: 'Bearer invalid.token.here' });

                expect(response.status).toBe(401);
            });
        });

        describe('POST /api/v1/auth/refresh-token', () => {
            it('should return new tokens with valid refresh token', async () => {
                const response = await api()
                    .post('/api/v1/auth/refresh-token')
                    .set(getRefreshHeader());

                expect(response.status).toBe(201);
                expect(response.body.data).toHaveProperty('token');
                expect(response.body.data.token).toHaveProperty('access_token');
                expect(response.body.data.token).toHaveProperty('refresh_token');
            });

            it('should fail when using access token instead of refresh token', async () => {
                const response = await api()
                    .post('/api/v1/auth/refresh-token')
                    .set(getAuthHeader());

                expect(response.status).toBe(401);
            });
        });
    });

    describe('DELETE /api/v1/auth/logout', () => {
        let logoutTokens;

        beforeAll(async () => {
            const result = await login(config.auth.adminEmail, config.auth.adminPassword);
            logoutTokens = result.tokens;
        });

        it('should logout successfully', async () => {
            const response = await api()
                .delete('/api/v1/auth/logout')
                .set({ Authorization: `Bearer ${logoutTokens.accessToken}` });

            expect(response.status).toBe(200);
        });

        it('should reject the token after logout', async () => {
            const response = await api()
                .get('/api/v1/auth/me')
                .set({ Authorization: `Bearer ${logoutTokens.accessToken}` });

            expect(response.status).toBe(401);
        });

        afterAll(() => {
            clearTokens();
        });
    });
});
