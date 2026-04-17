'use strict';

const request = require('supertest');
const { config } = require('../config');

const baseURL = config.app.url;
const api = () => request(baseURL);

module.exports = { api };
