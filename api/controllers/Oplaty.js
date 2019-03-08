import db from '../db'

const Oplaty = {

    async wszystkieOplaty(req, res) {
        const zapytanie = 'SELECT * FROM lotnisko.Oplaty'
        try {
            const {rows} = await db.query(zapytanie)
            return res.status(200).json({
                wszystkieOplaty: rows,
            })
        }   catch (error) {
            return res.status(400).json(error)
        }
    }
}

export default Oplaty