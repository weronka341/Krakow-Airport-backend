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

describe('Lotniska', () => {
    before((done) => {
        chai.request(app)
            .post('/api/zaloguj')
            .send(daneManagera)
            .end((err, res) => {
                managerToken = res.body.token
                done()
            })
    })

    it('powinno zwrocic wszystkie lotniska pod GET /api/lotniska', (done) => {
        chai.request(app)
            .get('/api/lotniska')
            .end((err, res) => {
                res.should.have.status(200)
                res.should.be.json
                res.should.be.an('Object')
                res.body.should.have.property('wszystkieLotniska')
                res.body.wszystkieLotniska.should.be.an('array')
                done()
            })
    })

    it('powinno zwrocic dane konkretnego lotniska pod GET /api/lotniska/:id', (done) => {
        chai.request(app)
            .get('/api/lotniska/38')
            .end((err, res) => {
                res.should.have.status(200)
                res.should.be.json
                res.should.be.an('Object')
                res.body.should.have.property('lotnisko')
                res.body.lotnisko.should.have.property('id_lotniska').eql(38)
                res.body.lotnisko.should.have.property('miasto').eql('Zakynthos')
                res.body.lotnisko.should.have.property('kraj').eql('Grecja')
                done()
            })
    })

    it('powinno dodac nowe lotnisko pod POST /api/lotniska', (done) => {
        chai.request(app)
            .post('/api/lotniska')
            .set('x-access-token', managerToken)
            .send({ 
                nazwa: 'Texas Airport',
                miasto: 'Texas',
                kraj: 'United States of America',
                IATA: 'TES',
                ICAO: 'TEXT',
                szer_geograficzna: '45.069722',
                dl_geograficzna: '-89.580278',
                strefa_czasowa: 'Sierra',
            })
            .end((err, res) => {
                res.should.have.status(200)
                res.body.should.have.property('wiadomosc').eql('Dodano lotnisko.')
                done()
            })
    })

    it('powinno usunac lotnisko pod DELETE /api/lotniska/:id', (done) => {
        chai.request(app)
            .delete('/api/lotniska/76')
            .set('x-access-token', managerToken)
            .end((err, res) => {
                res.should.have.status(200)
                res.body.should.have.property('wiadomosc').eql('Usunieto lotnisko.')
                done()
            })
    })
})
