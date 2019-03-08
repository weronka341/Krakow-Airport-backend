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

describe('Samoloty', () => {
    before((done) => {
        chai.request(app)
            .post('/api/zaloguj')
            .send(daneManagera)
            .end((err, res) => {
                managerToken = res.body.token
                done()
            })
    })

    it('powinno zwrocic wszystkie samoloty danej linii pod GET /api/samoloty/linie/:linia', (done) => {
        chai.request(app)
            .get('/api/samoloty/linie/12')
            .end((err, res) => {
                res.should.have.status(200)
                res.should.be.json
                res.should.be.an('Object')
                res.body.should.have.property('wszystkieSamoloty')
                res.body.wszystkieSamoloty.should.be.an('array')
                done()
            })
    })

    it('powinno zwrocic dane konkretnego samolotu pod GET /api/samoloty/:id', (done) => {
        chai.request(app)
            .get('/api/samoloty/16')
            .end((err, res) => {
                res.should.have.status(200)
                res.should.be.json
                res.should.be.an('Object')
                res.body.should.have.property('samolot')
                res.body.samolot.should.have.property('id_samolotu').eql(16)
                res.body.samolot.should.have.property('id_linii').eql(1)
                res.body.samolot.should.have.property('nazwa').eql('Airbus A321-231')
                done()
            })
    })

    it('powinno dodac nowy samolot pod POST /api/samoloty', (done) => {
        chai.request(app)
            .post('/api/samoloty')
            .set('x-access-token', managerToken)
            .send({ 
                id_linii: '1',
                model: 'A321',
                nazwa: 'Airbus A321-231',
                nr_rejestracyjny: 'SX-DGQ',
                liczba_miejsc: 189,
                masa_startowa: 89000
            })
            .end((err, res) => {
                res.should.have.status(200)
                res.body.should.have.property('wiadomosc').eql('Dodano samolot.')
                done()
            })
    })

    it('powinno usunac samolot pod DELETE /api/samoloty/:id', (done) => {
        chai.request(app)
            .delete('/api/samoloty/85')
            .set('x-access-token', managerToken)
            .end((err, res) => {
                res.should.have.status(200)
                res.body.should.have.property('wiadomosc').eql('Usunieto samolot.')
                done()
            })
    })
})
