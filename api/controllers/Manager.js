import db from '../db'
import AuthHelper from './AuthHelper'

const Manager = {
    async zaloguj(req, res) {
        if(!req.body.id_managera || !req.body.haslo) {
            return res.status(400).json({ wiadomosc: 'Nie podano wymaganych wartości!' })
        }

        const queryText = `SELECT * FROM lotnisko.managerowie WHERE id_managera = $1`
        try {
            const { rows } = await db.query(queryText, [req.body.id_managera])
            if(!rows[0]) {
                return res.status(400).json({ wiadomosc: 'Podano nieprawidłowe wartości.' })
            }
            if(!AuthHelper.comparePassword(rows[0].haslo, req.body.haslo)) {
                return res.status(400).json({ wiadomosc: 'Podano nieprawidłowe wartości.' })
            }
            const token = AuthHelper.generateToken(rows[0].id_managera)
            return res.status(200).json({ token })
        } catch(error) {
            return res.status(400).json(error)
        }
    },
}

export default Manager
