// src/api.js
import axios from "axios";

const API_URL = "http://localhost:5000"; // Make sure the backend URL is correct

export const dodajKnjigu = async (noviKnjiga) => {
    const response = await fetch('http://localhost:5000/api/dodajKnjigu', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(noviKnjiga),
    });

    const data = await response.json();
    return data;
};


export const fetchIznajmljivanjeInfo = async (idKnjige) => {
    try {
        console.log("Pozivam API za iznajmljivanje, ID knjige:", idKnjige);
        const response = await fetch(`http://localhost:5000/api/iznajmljivanje/${idKnjige}`); // Updated URL

        console.log("Status odgovora:", response.status); // Proveri status
        if (!response.ok) {
            throw new Error("Greška pri dohvatanju podataka");
        }

        const data = await response.json();
        console.log("Dobijeni podaci:", data);

        return data;
    } catch (error) {
        console.error("Greška:", error);
        return null;
    }
};


export const fetchBiblioteke = async () => {
    try {
        const response = await axios.get(`${API_URL}/biblioteke`);
        return response.data;
    } catch (error) {
        console.error("Greška pri dohvaćanju biblioteka:", error);
        return [];
    }
};

export const fetchKnjigeByBiblioteka = async (idBiblioteka) => {
    try {
        if (!idBiblioteka) {
            return [];
        }
        const response = await axios.get(`${API_URL}/knjige/${idBiblioteka}`);
        return response.data;
    } catch (error) {
        console.error("Greška pri dohvaćanju knjiga:", error);
        return [];
    }
};

export const fetchClanovi = async () => {
    try {
        const response = await axios.get(`${API_URL}/clanovi`);
        return response.data;
    } catch (error) {
        console.error("Greška pri dohvaćanju članova:", error);
        return [];
    }
};




