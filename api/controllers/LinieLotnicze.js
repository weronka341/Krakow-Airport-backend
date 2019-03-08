import db from '../db'

const LinieLotnicze = {
    async wszystkieLinie(req, res) {
        const zapytanie = 'SELECT * FROM lotnisko.Linie_lotnicze'
        try {
            const { rows, rowCount } = await db.query(zapytanie)
            return res.status(200).json({
                wszystkieLinie: rows,
                liczbaLinii: rowCount
            })
        } catch(error) {
            return res.status(400).json(error)
        }
    },

    async danaLinia(req, res) {
        const zapytanie = 'SELECT * FROM lotnisko.Linie_lotnicze WHERE id_linii = $1'
        try {
            const { rows } = await db.query(zapytanie, [req.params.id])
            res.status(200).json({ linia: rows[0] })
        } catch(error) {
            return res.status(400).json(error)
        }
    },

    async usunLinie(req, res) {
        const zapytanie = 'DELETE FROM lotnisko.Linie_lotnicze WHERE id_linii = $1 RETURNING *'
        try {
            const { rows } = await db.query(zapytanie, [req.params.id])
            if(!rows[0]) {
                return res.status(400).json({ wiadomosc: 'Nie ma takiej linii!' })
            }
            res.status(200).json({ wiadomosc: 'Usunieto linie lotnicza.'})
        } catch(error) {
            console.log(error)
            return res.status(400).json(error)
        }
    },

    async dodajLinie(req, res) {
        const zapytanie = 'INSERT INTO lotnisko.Linie_lotnicze VALUES (DEFAULT, $1, $2, $3, $4,$5)'
        const wartosciZapytania = [
            req.body.nazwa,
            req.body.IATA,
            req.body.ICAO,
            req.body.znak_wywolawczy,
            req.body.kraj
        ]
        try {
            await db.query(zapytanie, wartosciZapytania)
            res.status(200).json({ wiadomosc: 'Dodano linie lotnicza.' })   
        } catch(error) {
            if(error.routine === '_bt_check_unique') {
                return res.status(400).json({wiadomosc: 'Linia o podanej nazwie juz istnieje.' })
            }
            return res.status(400).json(error)
        }
    },
}

export default LinieLotnicze