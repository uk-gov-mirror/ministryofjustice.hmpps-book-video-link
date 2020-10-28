const express = require('express')
const request = require('supertest')

const setupRedirects = require('../setupRedirects')
const config = require('../config')

config.app.supportUrl = '//supportUrl'

describe('setup redirects', () => {
  let agent
  beforeEach(() => {
    const app = express()
    app.use(setupRedirects())

    agent = request.agent(app)
  })

  it('should redirect to the new support service when the old support url is used', done => {
    agent
      .get('/content/support')
      .expect('location', '//supportUrl')
      .expect(301, done)
  })
})
