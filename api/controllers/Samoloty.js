import db from '../db'

const Samoloty = {
    async wszystkieSamolotyDanejLinii(req, res) {
        const zapytanie = 'SELECT * FROM lotnisko.Samoloty WHERE id_linii = $1'
        try {
            const { rows, rowCount } = await db.query(zapytanie, [req.params.linia])
            res.status(200).json({
                wszystkieSamoloty: rows,
                liczbaSamolotow: rowCount
            })
        } catch(error) {
            return res.status(400).json(error)
        }
    },

    async danySamolot(req, res) {
        const zapytanie = 'SELECT * FROM lotnisko.Samoloty WHERE id_samolotu = $1'
        try {
            const { rows } = await db.query(zapytanie, [req.params.id])
            res.status(200).json({ samolot: rows[0] })
        } catch(error) {
            return res.status(400).json(error)
        }
    },

    async usunSamolot(req, res) {
        const zapytanie = 'DELETE FROM lotnisko.Samoloty WHERE id_samolotu = $1 RETURNING *'
        try {
            const { rows } = await db.query(zapytanie, [req.params.id])
            if(!rows[0]) {
                return res.status(400).json({ wiadomosc: 'Nie ma takiego samolotu!' })
            }
            res.status(200).json({ wiadomosc: 'Usunieto samolot.'})
        } catch(error) {
            return res.status(400).json(error)
        }
    },

    async dodajSamolot(req, res) {
        const zapytanie = 'INSERT INTO lotnisko.Samoloty VALUES (DEFAULT, $1, $2, $3, $4, $5, $6)'
        const wartosciZapytania = [
            req.body.id_linii,
            req.body.model,
            req.body.nazwa,
            req.body.nr_rejestracyjny,
            req.body.liczba_miejsc,
            req.body.masa_startowa
        ]
        try {
            await db.query(zapytanie, wartosciZapytania)
            res.status(200).json({ wiadomosc: 'Dodano samolot.' })   
        } catch(error) {
            if(error.routine === '_bt_check_unique') {
                return res.status(400).json({wiadomosc: 'Samolot o podanym numerze rejestracyjnym juz istnieje.' })
            }
            return res.status(400).json(error)
        }
    },
	async modyfikujSamolot(req, res) {
        const zapytanie = 'UPDATE lotnisko.Samoloty WHERE id_samolotu = $1'
        try {
            const { rows } = await db.query(zapytanie, [req.params.id])
            if(!rows[0]) {
                return res.status(400).json({ wiadomosc: 'Nie ma takiego samolotu!' })
            }
            res.status(200).json({ wiadomosc: 'Usunieto samolot.' })
        } catch(error) {
            return res.status(400).json(error)
        }
    },
}

export default Samoloty