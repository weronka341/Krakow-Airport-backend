import chai from 'chai'
import chaiHttp from 'chai-http'
import app from '../index'

chai.use(chaiHttp)
chai.should()

const daneManagera = {
    id_managera: 1,
    haslo: 'pass'
}


describe('Manager', () => {
    it('powinno zalogowac managera pod GET /api/zaloguj', (done) => {
        chai.request(app)
            .post('/api/zaloguj')
            .send(daneManagera)
            .end((err, res) => {
                res.should.have.status(200)
                res.body.should.have.property('token')
                done()
            })
    })
})
