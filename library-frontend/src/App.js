import React, { useEffect, useState } from "react";
import { fetchBiblioteke, fetchKnjigeByBiblioteka, fetchClanovi, dodajKnjigu, fetchIznajmljivanjeInfo } from "./api";
import "./App.css";
import process from 'process';



function App() {
  const [odabranaBiblioteka, setOdabranaBiblioteka] = useState("");
  const [knjige, setKnjige] = useState([]);
  const [clanovi, setClanovi] = useState([]);
  const [noviKnjiga, setNoviKnjiga] = useState({
    naslov: '',
    autor: '',
    datumobjave: '',
    pozajmljena: false,
    idbiblioteka: '',
  });
  const [biblioteke, setBiblioteke] = useState([]);
  const [isFormVisible, setIsFormVisible] = useState(false);

  const [odabranaKnjiga, setOdabranaKnjiga] = useState(null);
  const [isDialogVisible, setIsDialogVisible] = useState(false);
  const [iznajmljivanjeInfo, setIznajmljivanjeInfo] = useState(null);



  useEffect(() => {
    const loadClanovi = async () => {
      const clanData = await fetchClanovi();
      console.log(clanData);
      setClanovi(clanData);
    };
    loadClanovi();
  }, []);

  useEffect(() => {
    const loadBiblioteke = async () => {
      const libs = await fetchBiblioteke();
      setBiblioteke(libs);
    };
    loadBiblioteke();
  }, []);

  useEffect(() => {
    const loadKnjige = async () => {
      if (odabranaBiblioteka !== "") {
        const knjigeData = await fetchKnjigeByBiblioteka(odabranaBiblioteka);
        setKnjige(knjigeData);
      } else {
        setKnjige([]);
      }
    };
    loadKnjige();
  }, [odabranaBiblioteka]);

  const handleFormChange = (e) => {
    const { name, value, type, checked } = e.target;
    setNoviKnjiga((prevState) => ({
      ...prevState,
      [name]: type === 'checkbox' ? checked : (name === 'pozajmljena' ? value === '1' : value),
    }));
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    if (!noviKnjiga.idbiblioteka) {
      alert("Molimo odaberite biblioteku.");
      return;
    }
    try {
      const response = await dodajKnjigu(noviKnjiga);
      if (response) {
        alert("Knjiga je uspješno dodata!");
        setNoviKnjiga({
          naslov: '',
          autor: '',
          datumobjave: '',
          pozajmljena: false,
          idbiblioteka: '',
        });
        setIsFormVisible(false);

        // PONOVNO UČITAJ KNJIGE nakon dodavanja
        const knjigeData = await fetchKnjigeByBiblioteka(odabranaBiblioteka);
        setKnjige(knjigeData);
      }
    } catch (error) {
      console.error("Error:", error);
      alert("Došlo je do greške pri dodavanju knjige.");
    }
  };

  return (
    <div style={styles.container}>
      <header style={styles.header}>
        <h1>Biblioteka</h1>
      </header>

      <div style={styles.dropdownContainer}>
        <label style={styles.label}>Odaberite poslovnicu:</label>
        <select
          style={styles.dropdown}
          value={odabranaBiblioteka}
          onChange={(e) => setOdabranaBiblioteka(e.target.value)}
        >
          <option value="">-- Odaberite --</option>
          {biblioteke.map((bibl) => (
            <option key={bibl.idbiblioteka} value={bibl.idbiblioteka}>
              {bibl.mjesto}
            </option>
          ))}
        </select>
      </div>

      <button style={styles.button} onClick={() => setIsFormVisible(true)}>
        Dodaj knjigu
      </button>

      {isFormVisible && (
        <form onSubmit={handleFormSubmit} style={styles.formContainer}>
          <div style={styles.inputGroup}>
            <label style={styles.label}>Naslov:</label>
            <input
              type="text"
              name="naslov"
              value={noviKnjiga.naslov}
              onChange={handleFormChange}
              style={styles.input}
              required
            />
          </div>

          <div style={styles.inputGroup}>
            <label style={styles.label}>Autor:</label>
            <input
              type="text"
              name="autor"
              value={noviKnjiga.autor}
              onChange={handleFormChange}
              style={styles.input}
              required
            />
          </div>

          <div style={styles.inputGroup}>
            <label style={styles.label}>Godina objave:</label>
            <input
              type="number"
              name="datumobjave"
              value={noviKnjiga.datumobjave}
              onChange={handleFormChange}
              style={styles.input}
              required
            />
          </div>

          <div style={styles.inputGroup}>
            <label style={styles.label}>Pozajmljena:</label>
            <select
              name="pozajmljena"
              value={noviKnjiga.pozajmljena}
              onChange={handleFormChange}
              style={styles.input}
            >
              <option value={0}>Ne</option>
              <option value={1}>Da</option>
            </select>
          </div>

          <div style={styles.inputGroup}>
            <label style={styles.label}>Odaberite biblioteku:</label>
            <select
              name="idbiblioteka"
              value={noviKnjiga.idbiblioteka}
              onChange={handleFormChange}
              style={styles.input}
              required
            >
              <option value="">-- Odaberite biblioteku --</option>
              {biblioteke.map((bibl) => (
                <option key={bibl.idbiblioteka} value={bibl.idbiblioteka}>
                  {bibl.mjesto}
                </option>
              ))}
            </select>
          </div>

          <button type="submit" style={styles.button}>Dodaj knjigu</button>
        </form>
      )}

      <div style={styles.tableContainer}>
        <h2>Knjige u poslovnici</h2>
        {odabranaBiblioteka === "" ? (
          <p>Molimo odaberite poslovnicu.</p>
        ) : knjige.length === 0 ? (
          <p>Nema dostupnih knjiga u ovoj poslovnici.</p>
        ) : (
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}>Naslov</th>
                <th style={styles.th}>Autor</th>
                <th style={styles.th}>Godina objave</th>
                <th style={styles.th}>Pozajmljena</th>
                <th style={styles.th}>Akcija</th>
              </tr>
            </thead>
            <tbody>
              {knjige.map((knjiga) => (
                <tr key={knjiga.idknjiga}>
                  <td style={styles.td}>{knjiga.naslov}</td>
                  <td style={styles.td}>{knjiga.autor}</td>
                  <td style={styles.td}>{knjiga.datumobjave}</td>
                  <td style={styles.td}>{knjiga.pozajmljena ? "Da" : "Ne"}</td>
                  <td style={styles.td}>
                    <button
                      style={styles.button}
                      onClick={() => {
                        console.log("Kliknuto na knjigu:", knjiga.idknjiga);
                        setOdabranaKnjiga(knjiga);
                        setIsDialogVisible(true);

                        fetchIznajmljivanjeInfo(knjiga.idknjiga).then((data) => {
                          console.log("Podaci iz fetch-a:", data);
                          setIznajmljivanjeInfo(data);
                          console.log("Iznajmljivanje info after set:", iznajmljivanjeInfo);  // Ovdje proveri da li se stanje ažurira
                        }).catch((error) => {
                          console.error("Greška pri dohvatanju podataka:", error);
                        });

                      }}

                    >
                      Pregled
                    </button>


                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {isDialogVisible && odabranaKnjiga && (
        <div style={styles.dialogOverlay}>
          <div style={styles.dialogBox}>
            {console.log("Odabrana knjiga:", odabranaKnjiga)} {/* Ovdje provjeravamo da li je odabrana knjiga ispravna */}
            <h2 style={{ color: odabranaKnjiga.pozajmljena ? "red" : "green" }}>
              {odabranaKnjiga.pozajmljena ? "IZNAJMLJENA" : "SLOBODNA"}
            </h2>

            <p><strong>Naslov:</strong> {odabranaKnjiga.naslov}</p>
            <p><strong>Autor:</strong> {odabranaKnjiga.autor}</p>

            {iznajmljivanjeInfo && iznajmljivanjeInfo.length > 0 && (
              <div>
                <h3>Podaci o iznajmljivanju:</h3>
                <p><strong>Iznajmljena od:</strong> {iznajmljivanjeInfo[0].iznajmio}</p>
                <p><strong>Datum iznajmljivanja:</strong> {iznajmljivanjeInfo[0].datum_iznajmljivanja}</p>
              </div>
            )}


            {odabranaKnjiga.pozajmljena && !iznajmljivanjeInfo && (
              <p>Učitavanje podataka o iznajmljivanju...</p>
            )}

            <button style={styles.button} onClick={() => {
              setIsDialogVisible(false);
              setIznajmljivanjeInfo(null); // Reset podataka prilikom zatvaranja
            }}>
              Zatvori
            </button>
          </div>
        </div>
      )}




      <div style={styles.tableContainer}>
        <h2>Članovi biblioteke</h2>
        <table style={styles.table}>
          <thead>
            <tr>
              <th style={styles.th}>Ime i Prezime</th>
              <th style={styles.th}>JMBG</th>
            </tr>
          </thead>
          <tbody>
            {clanovi.map((clan) => (
              <tr key={clan.idclan}>
                <td style={styles.td}>{clan.imeprezime}</td>
                <td style={styles.td}>{clan.jmbg}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

const styles = {
  container: {
    fontFamily: "'Merriweather', serif",
    padding: "10px",
    backgroundImage: "url('https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSBk3PXjHUkgSxiR9jGe_QJuMOZ1c6l9n1yWA&s')",
    backgroundSize: "350px auto",
    backgroundPosition: "center center",
    backgroundRepeat: "no-repeat",
    backgroundAttachment: "fixed",
    position: "relative",
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    width: "98%",
    minHeight: "100vh",
  },
  header: {
    backgroundColor: "#800020",
    color: "white",
    padding: "20px",
    textAlign: "center",
    fontSize: "2rem",
    fontWeight: "bold",
    borderRadius: "8px",
  },
  dropdownContainer: {
    margin: "20px 0",
    display: "flex",
    flexDirection: "column",
    alignItems: "flex-start",
  },
  label: {
    fontSize: "1rem",
    fontWeight: "500",
    marginBottom: "8px",
  },
  dropdown: {
    padding: "10px",
    fontSize: "1rem",
    borderRadius: "5px",
    //border: "1px solid #800020",
    width: "100%",
    maxWidth: "300px",
  },
  button: {
    padding: "10px 20px",
    backgroundColor: "#800020",
    color: "white",
    border: "none",
    cursor: "pointer",
    borderRadius: "5px",
    fontSize: "1rem",
    fontWeight: "bold",
    margin: "10px 0",
    alignSelf: "flex-start",
  },

  dialogOverlay: {
    position: "fixed",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1000,
  },

  dialogBox: {
    backgroundColor: "white",
    padding: "20px",
    borderRadius: "8px",
    boxShadow: "0 2px 10px rgba(0, 0, 0, 0.1)",
    maxWidth: "400px",
    width: "90%",
    textAlign: "center",
  },

  formContainer: {
    display: "flex",
    flexDirection: "column",
    gap: "15px",
    backgroundColor: "rgba(255, 255, 255, 0.95)",
    padding: "20px",
    borderRadius: "8px",
    //border: "1px solid #800020",
    maxWidth: "400px",
    margin: "20px auto",
  },
  inputGroup: {
    display: "flex",
    flexDirection: "column",
    alignItems: "flex-start",
  },
  input: {
    padding: "10px",
    fontSize: "1rem",
    borderRadius: "5px",
    border: "1px solid #800020",
    width: "100%",
  },
  tableContainer: {
    marginTop: "20px",
    backgroundColor: "rgba(255, 255, 255, 0.95)",
    padding: "20px",
    borderRadius: "8px",
    //border: "1px solid #800020",
  },
  table: {
    width: "100%",
    borderCollapse: "collapse",
  },
  th: {
    //border: "1px solid #800020",
    padding: "12px",
    backgroundColor: "#f8e1e9",
    textAlign: "left",
    fontWeight: "bold",
  },
  td: {
    //border: "1px solid #800020",
    padding: "12px",
  },
};

export default App;
