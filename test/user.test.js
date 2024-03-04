// const request = require('supertest');
const app = require('../server');

// test that a false username and password cannot login
describe('GET /', () => {
  test('Incorrect Login details get Rejected', async () => {
    const response = await request(app).get('/login');
    expect(response.statusCode).toBe(401);
    expect(response.text).toContain('Welcome to E-Invoisce Storage');
  });
});

// test that a correct username and false password cannot login

// test that a correct username and password CAN login

// test that a new registration can occur and user can login with those details
