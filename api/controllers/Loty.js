import db from '../db'

const Loty = {
    async dodajLoty(req, res) {
        if(!req.body.dane_samolotu.id_samolotu || !req.body.przylot.nr_lotu || !req.body.przylot.czas_przylotu || !req.body.przylot.czas_wylotu || !req.body.przylot.skad || !req.body.odlot.nr_lotu || !req.body.odlot.czas_przylotu || !req.body.odlot.czas_wylotu || !req.body.odlot.dokad ) {
            return res.status(400).json({
                wiadomosc: 'Nie podano wszystkich wartości do stworzenia przylotu i odlotu!'
            })
        }
        const zapytanie = 'INSERT INTO lotnisko.Loty (id_samolotu, nr_lotu, czas_wylotu, czas_przylotu, skad, dokad) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *'

        const client = await db.pool.connect()
        try {
            await client.query('BEGIN')
            try {
                await client.query(zapytanie, [
                    req.body.dane_samolotu.id_samolotu,
                    req.body.przylot.nr_lotu,
                    req.body.przylot.czas_wylotu,
                    req.body.przylot.czas_przylotu,
                    req.body.przylot.skad,
                    0
                ])

                await client.query(zapytanie, [
                    req.body.dane_samolotu.id_samolotu,
                    req.body.odlot.nr_lotu,
                    req.body.odlot.czas_wylotu,
                    req.body.odlot.czas_przylotu,
                    0,
                    req.body.odlot.dokad,
                ])
                
                await client.query('COMMIT')
            } catch(error) {
                await client.query('ROLLBACK')

                if(error.routine === 'exec_stmt_raise') {
                    return res.status(400).json({
                        wiadomosc: error.detail,
                        wskazowka: error.hint
                    })
                }
                return res.status(400).json(error)
            }
        } finally {
            client.release()
        }
        return res.status(200).json({ wiadomosc: 'Dodano loty.' })
    },

    async wszystkiePrzyloty(req, res) {
        const zapytanie = 'SELECT * FROM lotnisko.Przyloty_Manager'
        try {
            const { rows, rowCount } = await db.query(zapytanie)
            return res.status(200).json({
                wszystkiePrzyloty: rows,
                liczbaPrzylotow: rowCount
            })
        } catch(error) {
            return res.status(400).json({
                wiadomosc: error.detail,
                wskazowka: error.hint
            })
        }
    },

    async przylotyWybranaData(req, res) {
        const zapytanie = 'SELECT * FROM lotnisko.Przyloty_Manager WHERE data_przylotu = $1'
        const dataJakoString = '' + req.params.data.slice(0,4) + '-' + req.params.data.slice(4,6) + '-' + req.params.data.slice(6,8)
      
        try {
            const { rows, rowCount } = await db.query(zapytanie, [dataJakoString])
            return res.status(200).json({
                wszystkiePrzyloty: rows,
                liczbaPrzylotow: rowCount
            })
        } catch(error) {
            return res.status(400).json({
                wiadomosc: error.detail,
                wskazowka: error.hint
            })
        }
    },

    async odlotyWybranaData(req, res) {
        const zapytanie = 'SELECT * FROM lotnisko.Odloty_Manager WHERE data_wylotu = $1'
        const dataJakoString = '' + req.params.data.slice(0,4) + '-' + req.params.data.slice(4,6) + '-' + req.params.data.slice(6,8)
      
        try {
            const { rows, rowCount } = await db.query(zapytanie, [dataJakoString])
            return res.status(200).json({
                wszystkieOdloty: rows,
                liczbaOdlotow: rowCount
            })
        } catch(error) {
            return res.status(400).json({
                wiadomosc: error.detail,
                wskazowka: error.hint
            })
        }
    },

    async wszystkieOdloty(req, res) {
        const zapytanie = 'SELECT * FROM lotnisko.Odloty_Manager'
        try {
            const { rows, rowCount } = await db.query(zapytanie)
            return res.status(200).json({
                wszystkieOdloty: rows,
                liczbaOdlotow: rowCount
            })
        } catch(error) {
            return res.status(400).json({
                wiadomosc: error.detail,
                wskazowka: error.hint
            })
        }
    },

    async danyLot(req, res) {
        const zapytanie = 'SELECT * FROM lotnisko.zwrocPrzylotLubOdlot($1);'
        try {
            const { rows } = await db.query(zapytanie, [req.params.id])
            return res.status(200).json({
                lot: rows[0]
            })
        } catch(error) {
            return res.status(400).json({
                wiadomosc: error.detail,
                wskazowka: error.hint
            })
        }
    },

    async usunLot(req, res) {
        const zapytanie = 'DELETE FROM lotnisko.Loty WHERE id_lotu = $1 RETURNING *'
        try {
            const { rows } = await db.query(zapytanie, [req.params.id])
            if(!rows[0]) {
                return res.status(400).json({ wiadomosc: 'Nie ma takiego lotu!' })
            }
            return res.status(200).json({ wiadomosc: 'Usunieto lot.'})
        } catch(error) {
            return res.status(400).json({
                wiadomosc: error.detail,
                wskazowka: error.hint
            })
        }

    },
}

export default Loty
