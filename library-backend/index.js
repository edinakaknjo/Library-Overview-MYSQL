// Import required packages using ES module syntax
import dotenv from 'dotenv';
import express from 'express';
import mysql from 'mysql2';
import cors from 'cors';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// Connect to MySQL database
const db = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
});

db.connect((err) => {
    if (err) {
        console.error("Error connecting to the database:", err);
        return;
    }
    console.log("Connected to MySQL database!");
});

app.get("/biblioteke", (req, res) => {
    const query = "SELECT * FROM biblioteka";
    db.query(query, (err, results) => {
        if (err) {
            console.error("Error fetching libraries:", err);
            return res.status(500).json({ error: "Database error" });
        }
        res.json(results);
    });
});

app.get("/knjige/:idBiblioteka", (req, res) => {
    const { idBiblioteka } = req.params;
    const query = `
        SELECT k.idknjiga, k.naslov, k.autor, k.datumobjave, k.pozajmljena
        FROM knjiga k
        INNER JOIN knjiga_biblioteka kb ON k.idknjiga = kb.idknjiga
        WHERE kb.idbiblioteka = ?
    `;
    db.query(query, [idBiblioteka], (err, results) => {
        if (err) {
            console.error("Error fetching books:", err);
            return res.status(500).json({ error: "Database error" });
        }
        res.json(results);
    });
});

app.get("/clanovi", (req, res) => {
    const query = "SELECT * FROM clan";
    db.query(query, (err, results) => {
        if (err) {
            console.error("Error :", err);
            return res.status(500).json({ error: "Database error" });
        }
        console.log("Fetched members:", results);
        res.json(results);
    });
});

app.get("/api/iznajmljivanje/:idknjiga", (req, res) => {
    const { idknjiga } = req.params;

    const query = `
        SELECT 
            i.idiznajmljivanje, i.datum_iznajmljivanja, i.datum_vracanja,
            c.imeprezime AS iznajmio, c.jmbg
        FROM iznajmljivanje i
        JOIN clan c ON i.idclan = c.idclan
        WHERE i.idknjiga = ?
    `;

    db.query(query, [idknjiga], (err, results) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ error: "Database error" });
        }
        res.json(results.length > 0 ? results : null);
    });
});


app.post('/api/dodajKnjigu', async (req, res) => {
    const { naslov, autor, datumobjave, pozajmljena, idbiblioteka } = req.body;

    try {
        // Koristi .promise() za podršku async/await
        const [result] = await db.promise().query(
            `INSERT INTO knjiga (naslov, autor, datumobjave, pozajmljena) VALUES (?, ?, ?, ?)`,
            [naslov, autor, datumobjave, pozajmljena]
        );

        const knjigaId = result.insertId;

        await db.promise().query(
            `INSERT INTO knjiga_biblioteka (idknjiga, idbiblioteka) VALUES (?, ?)`,
            [knjigaId, idbiblioteka]
        );

        res.status(201).json({ message: 'Knjiga je uspešno dodata!' });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ message: 'Došlo je do greške prilikom dodavanja knjige.' });
    }
});


const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});
