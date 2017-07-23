const request = require('supertest')
const chai = require('chai')
const server = require('../../server')

describe('Test API server for /api route', function () {
  it('server responds to GET /api with json content type header', (done) => {
    request(server)
      .get('/api')
      .expect('Content-Type', /json/)
    done()
  })

  it('server responds to GET /api with 400 error when no params are passed', (done) => {
    request(server)
      .get('/api')
      .expect(400)
      .end((err, res) => {
        chai.expect(res.body.error.message).to.equal('Request parameters are missing')
        done()
      })
  })

  it('server responds to POST /api with Method Not Allowed and includes Allow header', (done) => {
    request(server)
      .post('/api')
      .expect('Allow', 'GET')
      .expect(405, done)
  })

  it('server responds to GET /api with 200 when called with valid file', (done) => {
    request(server)
      .get('/api')
      .query({
        path: '/var/log/test.log',
        page: 1,
        perPage: 10
      })
      .end((err, res) => {
        chai.expect(res.body.lines).to.be.an('array')
          .that.includes('line 1')
          .that.includes('line 2')
          .that.includes('line 3')
        chai.expect(res.body.counts.totalLines).to.equal(3)
        done()
      })
  })

  it('server responds to GET /api with error when page param is not a number', (done) => {
    request(server)
      .get('/api')
      .query({
        path: '/var/log/test.log',
        page: 'x',
        perPage: 10
      })
      .expect(400)
      .end((err, res) => {
        chai.expect(res.body).to.have.property('error')
        chai.expect(res.body.error).to.not.equal(null)
        done()
      })
  })

  it('server responds to GET /api with error when page param is negative', (done) => {
    request(server)
      .get('/api')
      .query({
        path: '/var/log/test.log',
        page: -8,
        perPage: 10
      })
      .expect(400)
      .end((err, res) => {
        chai.expect(res.body.error.details).to.deep.contain({ param: 'page', min: 1, type: 'int' })
        done()
      })
  })

  it('server responds to GET /api with error when perPage param exceeds min range', (done) => {
    request(server)
      .get('/api')
      .query({
        path: '/var/log/test.log',
        page: 1,
        perPage: 0
      })
      .expect(400)
      .end((err, res) => {
        chai.expect(res.body.error.details).to.deep.contain({ param: 'perPage', min: 1, max: 100, type: 'int' })
        done()
      })
  })

  it('server responds to GET /api with error when perPage param exceeds max range', (done) => {
    request(server)
      .get('/api')
      .query({
        path: '/var/log/test.log',
        page: 1,
        perPage: 777
      })
      .expect(400)
      .end((err, res) => {
        chai.expect(res.body.error.details).to.deep.contain({ param: 'perPage', min: 1, max: 100, type: 'int' })
        done()
      })
  })

  it('server responds to GET /api with error when path is outside of whitelisted scope', (done) => {
    request(server)
      .get('/api')
      .query({
        path: '/dev/random',
        page: 1,
        perPage: 10
      })
      .expect(400)
      .end((err, res) => {
        chai.expect(res.body.error.message).to.equal('File path not allowed')
        done()
      })
  })

  it('server responds to GET /api with success after normalising log file path', (done) => {
    request(server)
      .get('/api')
      .query({
        path: '/var/log/../log/../log/test.log',
        page: 1,
        perPage: 10
      })
      .expect(200, done)
  })

  it('server responds to GET /api with error when file does not exist', (done) => {
    request(server)
      .get('/api')
      .query({
        path: '/var/log/does_not_exist.log',
        page: 1,
        perPage: 10
      })
      .expect(400)
      .end((err, res) => {
        chai.expect(res.body.error.message).to.equal('No such file')
        done()
      })
  })

  it('server responds to GET /api with error when lines are out of range', (done) => {
    request(server)
      .get('/api')
      .query({
        path: '/var/log/test.log',
        page: 777,
        perPage: 10
      })
      .expect(400)
      .end((err, res) => {
        chai.expect(res.body.error.message).to.equal('Out of range')
        done()
      })
  })

  it('server responds with 404 for everything else', (done) => {
    request(server)
      .get('/this/does/not/exist')
      .expect(404, done)
  })
})
