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

describe('Loty', () => {
    before((done) => {
        chai.request(app)
            .post('/api/zaloguj')
            .send(daneManagera)
            .end((err, res) => {
                managerToken = res.body.token
                done()
            })
    })

    it('powinno dodac przylot i odlot pod POST /api/loty', (done) => {
        chai.request(app)
            .post('/api/loty')
            .set('x-access-token', managerToken)
            .send({
                dane_samolotu: {
                    id_samolotu: '327',
                },
                przylot: {
                    nr_lotu: 'FR 6876',
                    czas_wylotu: '2019-01-21 2:25:00',
                    czas_przylotu: '2019-01-21 4:20:00',
                    skad: '66'
                },
                odlot: {
                    nr_lotu: 'FR 6877',
                    czas_wylotu: '2019-01-21 5:20:00',
                    czas_przylotu: '2019-01-21 7:15:00',
                    dokad: '66'
                }
            })
            .end((err, res) => {
                res.should.have.status(200)
                res.should.be.json
                res.should.be.an('Object')
                res.body.should.have.property('wiadomosc').eql('Dodano loty.')
                done()
            })
    })

    it('powinno zwrocic wszystkie przyloty po GET /api/przyloty', (done) => {
        chai.request(app)
            .get('/api/przyloty')
            .end((err, res) => {
                res.should.have.status(200)
                res.should.be.json
                res.should.be.an('Object')
                res.body.should.have.property('wszystkiePrzyloty')
                res.body.wszystkiePrzyloty.should.be.an('Array')
                done()
            })
    })

    it('powinno zwrocic wszystkie odloty po GET /api/odloty', (done) => {
        chai.request(app)
            .get('/api/odloty')
            .end((err, res) => {
                res.should.have.status(200)
                res.should.be.json
                res.should.be.an('Object')
                res.body.should.have.property('wszystkieOdloty')
                res.body.wszystkieOdloty.should.be.an('Array')
                done()
            })
    })

    it('powinno zwroci szczegolowe dane danego lotu pod GET /api/lot/:id;', (done) => {
        chai.request(app)
            .get('/api/lot/1')
            .end((err, res) => {
                res.should.have.status(200)
                res.should.be.json
                res.should.be.an('Object')
                res.body.should.have.property('lot')
                res.body.lot.should.be.an('Object')
                done()
            })
    })

    it('powinno usunac dany lot pod DELETE /api/lot/:id', (done) => {
        chai.request(app)
            .delete('/api/lot/1')
            .set('x-access-token', managerToken)
            .end((err, res) => {
                res.should.have.status(200)
                res.should.be.json
                res.should.be.an('Object')
                res.body.should.have.property('wiadomosc').eql('Usunieto lot.')
                done()
            })
    })

    //Testy nieprawidłowych wartośći

    // 1. Samolot zajęty w tym czasie:

    it('nie powinno dodać lotu ze wzgledu na niedostępność samolotu w tym czasie pod POST /api/loty', (done) => {
        chai.request(app)
            .post('/api/loty')
            .set('x-access-token', managerToken)
            .send({
                dane_samolotu: {
                    id_samolotu: '326',
                },
                przylot: {
                    nr_lotu: 'FR 6876',
                    czas_wylotu: '2019-01-21 4:20:00',
                    czas_przylotu: '2019-01-21 6:30:00',
                    skad: '66'
                },
                odlot: {
                    nr_lotu: 'FR 6877',
                    czas_wylotu: '2019-01-21 7:05:00',
                    czas_przylotu: '2019-01-21 8:00:00',
                    dokad: '66'
                }
            })
            .end((err, res) => {
                res.should.have.status(400)
                res.should.be.json
                res.should.be.an('Object')
                res.body.should.have.property('wiadomosc').eql('Wybrany samolot, w podanym czasie odbywa inny lot.')
                res.body.should.have.property('wskazowka').eql('Należy wybrać inny samolot lub zmienić termin lotów.')
                done()
            })
    })

// 2. Nie ma wolnego pasa.

    it('nie powinno dodać lotu ze wzgledu na niedostępność pasu startowego w tym czasie pod POST /api/loty', (done) => {
        chai.request(app)
            .post('/api/loty')
            .set('x-access-token', managerToken)
            .send({
                dane_samolotu: {
                    id_samolotu: '327',
                },
                przylot: {
                    nr_lotu: 'FR 6876',
                    czas_wylotu: '2019-01-21 7:55:00',
                    czas_przylotu: '2019-01-21 9:00:00',
                    skad: '66'
                },
                odlot: {
                    nr_lotu: 'FR 6877',
                    czas_wylotu: '2019-01-21 10:30:00',
                    czas_przylotu: '2019-01-21 11:25:00',
                    dokad: '66'
                }
            })
            .end((err, res) => {
                res.should.have.status(400)
                res.should.be.json
                res.should.be.an('Object')
                res.body.should.have.property('wiadomosc').eql('Wszystkie pasy w proponowanym momencie przylotu są zajęte.')
                res.body.should.have.property('wskazowka').eql('Należy zmienić termin przylotu.')
                done()
            })
    })

// 3. Nie ma takiego samolotu.

    it('nie powinno dodać lotu, ponieważ wybrany samolot nie jest zarejestrowany w bazie pod POST /api/loty', (done) => {
        chai.request(app)
            .post('/api/loty')
            .set('x-access-token', managerToken)
            .send({
                dane_samolotu: {
                    id_samolotu: '5127',
                },
                przylot: {
                    nr_lotu: 'FR 6876',
                    czas_wylotu: '2019-01-21 7:55:00',
                    czas_przylotu: '2019-01-21 9:00:00',
                    skad: '66'
                },
                odlot: {
                    nr_lotu: 'FR 6877',
                    czas_wylotu: '2019-01-21 10:30:00',
                    czas_przylotu: '2019-01-21 11:25:00',
                    dokad: '66'
                }
            })
            .end((err, res) => {
                // console.log(res.body)
                res.should.have.status(400)
                res.should.be.json
                res.should.be.an('Object')
                
                //res.body.should.have.property('wiadomosc').eql('')
                done()
            })
    })

// 4. Numer lotu nie należy do linii, której samolot wybrano.

    it('nie powinno dodać lotu, ponieważ nr lotu nie jest zgodny z wybraną linią lotniczą pod POST /api/loty', (done) => {
        chai.request(app)
            .post('/api/loty')
            .set('x-access-token', managerToken)
            .send({
                dane_samolotu: {
                    id_samolotu: '121',
                },
                przylot: {
                    nr_lotu: 'FR 6876',
                    czas_wylotu: '2019-01-21 4:20:00',
                    czas_przylotu: '2019-01-21 6:30:00',
                    skad: '66'
                },
                odlot: {
                    nr_lotu: 'FR 6877',
                    czas_wylotu: '2019-01-21 7:05:00',
                    czas_przylotu: '2019-01-21 8:00:00',
                    dokad: '66'
                }
            })
            .end((err, res) => {
                res.should.have.status(400)
                res.should.be.json
                res.should.be.an('Object')
                res.body.should.have.property('wiadomosc').eql('Podano niepoprawny numer lotu.')
                res.body.should.have.property('wskazowka').eql('Numer lotu musi zawierać kod IATA linii lotniczej.')
                done()
            })
    })

// //5. Termin lotu zbyt bliski by można było go dodać.

    it('nie powinno dodać lotu, ponieważ jego termin jest zbyt bliski pod POST /api/loty', (done) => {
        chai.request(app)
            .post('/api/loty')
            .set('x-access-token', managerToken)
            .send({
                    dane_samolotu: {
                        id_samolotu: '327',
                    },
                    przylot: {
                        nr_lotu: 'FR 6876',
                        czas_wylotu: '2019-01-9 4:20:00',
                        czas_przylotu: '2019-01-9 6:30:00',
                        skad: '66'
                    },
                    odlot: {
                        nr_lotu: 'FR 6877',
                        czas_wylotu: '2019-01-9 7:05:00',
                        czas_przylotu: '2019-01-9 8:00:00',
                        dokad: '66'
                    }
                })
                .end((err, res) => {
                    res.should.have.status(400)
                    res.should.be.json
                    res.should.be.an('Object')
                    res.body.should.have.property('wiadomosc').eql('Zbyt mało czasu do zamawianego lotu.')
                    res.body.should.have.property('wskazowka').eql('Loty należy zamawiać z co najmniej 24-ro godzinnym wyprzedzeniem.')
                    done()
            })
    })

// //6. Wybrane lotnisko nie jest jeszcze zarejestrowane w bazie.

    it('nie powinno dodać lotu, ponieważ wybrane lotnisko nie jest zarejestrowane w bazie pod POST /api/loty', (done) => {
        chai.request(app)
            .post('/api/loty')
            .set('x-access-token', managerToken)
            .send({
                    dane_samolotu: {
                        id_samolotu: '327',
                    },
                    przylot: {
                        nr_lotu: 'FR 6876',
                        czas_wylotu: '2019-01-21 4:20:00',
                        czas_przylotu: '2019-01-21 6:30:00',
                        skad: '1234567'
                    },
                    odlot: {
                        nr_lotu: 'FR 6877',
                        czas_wylotu: '2019-01-21 7:05:00',
                        czas_przylotu: '2019-01-21 8:00:00',
                        dokad: '1234567'
                    }
                })
                .end((err, res) => {
                    res.should.have.status(400)
                    res.should.be.json
                    res.should.be.an('Object')
                    done()
                })
    })
})
