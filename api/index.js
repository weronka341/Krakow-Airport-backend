import express from 'express'
import 'babel-polyfill'
import Auth from './middleware/Auth'
import Manager from './controllers/Manager'
import Lotniska from './controllers/Lotniska'
import Loty from './controllers/Loty'
import Samoloty from './controllers/Samoloty'
import LinieLotnicze from './controllers/LinieLotnicze'
import Oplaty from './controllers/Oplaty'

const app = express()
app.use(express.json())
app.use(require('cors')())
app.set('port', process.env.PORT || 3001)
app.set('host', process.env.HOST || 'localhost')

const router = express.Router()
app.use('/api', router)

router.get('/', (req, res) => {
    res.status(200).json({ message: 'Hello Wercia' })
})

// Uzytkownicy
router.post('/zaloguj', Manager.zaloguj)

// Lotniska
router.get('/lotniska', Lotniska.wszystkieLotniska)
router.post('/lotniska', Auth.verifyToken, Lotniska.dodajLotnisko)
router.get('/lotniska/:id', Lotniska.daneLotnisko)
router.delete('/lotniska/:id', Auth.verifyToken, Lotniska.usunLotnisko)

//Loty
router.post('/loty', Auth.verifyToken, Loty.dodajLoty)
router.get('/przyloty', Loty.wszystkiePrzyloty)
router.get('/przyloty/:data', Loty.przylotyWybranaData)
router.get('/odloty', Loty.wszystkieOdloty)
router.get('/odloty/:data', Loty.odlotyWybranaData)
router.get('/lot/:id', Loty.danyLot)
router.delete('/lot/:id', Auth.verifyToken, Loty.usunLot)

// Samoloty
router.get('/samoloty/linie/:linia', Samoloty.wszystkieSamolotyDanejLinii)
router.post('/samoloty', Auth.verifyToken, Samoloty.dodajSamolot)
router.get('/samoloty/:id', Samoloty.danySamolot)
router.delete('/samoloty/:id', Auth.verifyToken, Samoloty.usunSamolot)
router.put('/samoloty/:id', Auth.verifyToken, Samoloty.modyfikujSamolot)

// Linie lotnicze
router.get('/linie', LinieLotnicze.wszystkieLinie)
router.post('/linie', Auth.verifyToken, LinieLotnicze.dodajLinie)
router.get('/linie/:id', LinieLotnicze.danaLinia)
router.delete('/linie/:id', Auth.verifyToken, LinieLotnicze.usunLinie)

//Oplaty
router.get('/oplaty', Oplaty.wszystkieOplaty)


app.listen(app.get('port'), () => {
    console.log('Express started on http://' + app.get('host') + ':' + app.get('port') + '/api; press Ctrl-C to terminate.')
})
    
export default app
