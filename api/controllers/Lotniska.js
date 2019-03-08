import db from '../db'

const Lotniska = {
    async wszystkieLotniska(req, res) {
        const zapytanie = 'SELECT * FROM lotnisko.Lotniska WHERE id_lotniska != 0'
        try {
            const { rows, rowCount } = await db.query(zapytanie)
            res.status(200).json({
                wszystkieLotniska: rows,
                liczbaLotnisk: rowCount
            })
        } catch(error) {
            return res.status(400).json(error)
        }
    },

    async daneLotnisko(req, res) {
        const zapytanie = 'SELECT * FROM lotnisko.Lotniska WHERE id_lotniska = $1'
        try {
            const { rows } = await db.query(zapytanie, [req.params.id])
            res.status(200).json({ lotnisko: rows[0] })
        } catch(error) {
            return res.status(400).json(error)
        }
    },

    async usunLotnisko(req, res) {
        const zapytanie = 'DELETE FROM lotnisko.Lotniska WHERE id_lotniska = $1 RETURNING *'
        try {
            const { rows } = await db.query(zapytanie, [req.params.id])
            if(!rows[0]) {
                return res.status(400).json({ wiadomosc: 'Nie ma takiego lotniska!' })
            }
            res.status(200).json({ wiadomosc: 'Usunieto lotnisko.'})
        } catch(error) {
            return res.status(400).json(error)
        }
    },

    async dodajLotnisko(req, res) {
        const zapytanie = 'INSERT INTO lotnisko.Lotniska VALUES (DEFAULT, $1, $2, $3, $4, $5, $6, $7, $8) RETURNING *'
        const wartosciZapytania = [
            req.body.nazwa,
            req.body.miasto,
            req.body.kraj,
            req.body.IATA,
            req.body.ICAO,
            req.body.szer_geograficzna,
            req.body.dl_geograficzna,
            req.body.strefa_czasowa
        ]
        try {
            await db.query(zapytanie, wartosciZapytania)
            res.status(200).json({ wiadomosc: 'Dodano lotnisko.'})   
        } catch(error) {
            if(error.routine === '_bt_check_unique') {
                return res.status(400).json({wiadomosc: 'Lotnisko o podanej nazwie juz istnieje.'})
            }
            return res.status(400).json(error)
        }
    }
}

export default Lotniska