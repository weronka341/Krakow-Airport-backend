import chai from 'chai'
import chaiHttp from 'chai-http'
import app from '../index'

chai.use(chaiHttp)
chai.should()

let managerToken

const daneManagera = {
    id_managera: 1,
    haslo: 'pass'
}

describe('Linie Lotnicze', () => {
    before((done) => {
        chai.request(app)
            .post('/api/zaloguj')
            .send(daneManagera)
            .end((err, res) => {
                managerToken = res.body.token
                done()
            })
    })

    it('powinno zwrocic wszystkie linie lotnicze pod GET /api/linie', (done) => {
        chai.request(app)
            .get('/api/linie')
            .end((err, res) => {
                res.should.have.status(200)
                res.should.be.json
                res.should.be.an('Object')
                res.body.should.have.property('wszystkieLinie')
                res.body.wszystkieLinie.should.be.an('array')
                done()
            })
    })

    it('powinno zwrocic dane konkretnej linii pod GET /api/linia/:id', (done) => {
        chai.request(app)
            .get('/api/linie/3')
            .end((err, res) => {
                res.should.have.status(200)
                res.should.be.json
                res.should.be.an('Object')
                res.body.should.have.property('linia')
                res.body.linia.should.have.property('id_linii').eql(3)
                res.body.linia.should.have.property('icao').eql('BAW')
                res.body.linia.should.have.property('kraj').eql('Wielka Brytania')
                done()
            })
    })

    it('powinno dodac nowa linie lotnicza pod POST /api/linie', (done) => {
        chai.request(app)
            .post('/api/linie')
            .set('x-access-token', managerToken)
            .send({ 
                nazwa: 'Test',
                IATA: 'TE',
                ICAO: 'TES',
                znak_wywolawczy: 'TEST',
                kraj: 'test',
            })
            .end((err, res) => {
                res.should.have.status(200)
                res.body.should.have.property('wiadomosc').eql('Dodano linie lotnicza.')
                done()
            })
    })

    it('powinno usunac linie lotnicza pod DELETE /api/linie/:id', (done) => {
        chai.request(app)
            .delete('/api/linie/2')
            .set('x-access-token', managerToken)
            .end((err, res) => {
                res.should.have.status(200)
                res.body.should.have.property('wiadomosc').eql('Usunieto linie lotnicza.')
                done()
            })
    })

})


