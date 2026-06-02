import React, { useEffect, useMemo, useState } from "react";

const STORAGE_KEY = "hackathon-deal-builder-v1";

const defaultData = {
  companyOptions: [
    "Jukolan Juusto",
    "Metsä Group",
    "SMA Minerals",
    "Muu verkoston yritys"
  ],
  challengeOptions: [
    "Sivuvirralle uusi käyttö",
    "Prosessiteollisuuden sivuvirtojen hyödyntäminen",
    "Tyhjien kiinteistöjen uusi käyttö",
    "Maatalousdatan hyödyntäminen päätöksenteossa",
    "Uusi liiketoimintamalli kiertotalouteen",
    "Biotalouden kestävyysongelman ratkaiseminen"
  ],
  reasons: [
    "Tarvitaan uusia ideoita",
    "Tarvitaan eri näkökulmia",
    "Ratkaisua ei vielä tiedetä",
    "Halutaan nopeasti vaihtoehtoja",
    "Tarvitaan sidosryhmien aktivointia",
    "Halutaan tunnistaa pilotointikelpoisia konsepteja"
  ],
  bonusCards: [
    "Dataa ei ole valmiina",
    "Aikaa on vain 24 tuntia",
    "Mukana on vain yksi alan asiantuntija",
    "Yritys haluaa mitattavaa liiketoimintahyötyä nopeasti",
    "Ratkaisun pitäisi toimia myös pk-yritykselle"
  ],
  submissions: [],
  votes: {},
  settings: {
    title: "Hackathon Deal Builder",
    subtitle:
      "Nimeä yritys, määritä haaste ja perustele, miksi hackathon on oikea ratkaisu.",
    timerMinutes: 15
  }
};

// ✅ KORJATTU CSV FUNKTIO (tässä oli bugi)
function toCsv(rows) {
  const escape = (value) => {
    const s = String(value ?? "");
    if (/[",\n]/.test(s)) {
      return `"${s.replace(/"/g, '""')}"`;
    }
    return s;
  };
  return rows.map((row) => row.map(escape).join(",")).join("\n");
}

export default function HackathonDealBuilder() {
  const [data, setData] = useState(defaultData);
  const [tab, setTab] = useState("pelaa");
  const [groupName, setGroupName] = useState("");
  const [selectedCompany, setSelectedCompany] = useState("");
  const [customCompany, setCustomCompany] = useState("");
  const [selectedChallenge, setSelectedChallenge] = useState("");
  const [customChallenge, setCustomChallenge] = useState("");
  const [selectedReasons, setSelectedReasons] = useState([]);
  const [valueForCompany, setValueForCompany] = useState("");
  const [hackathonFocus, setHackathonFocus] = useState("");

  useEffect(() => {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      setData(JSON.parse(raw));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  }, [data]);

  function saveSubmission() {

if (!customCompany || !selectedChallenge) {
  alert("Täytä yritys ja valitse haaste");
  return;
}


    const submission = {
      id: Math.random().toString(36),
      groupName: groupName || "Ryhmä",
     company: customCompany,
   challenge: selectedChallenge === "Muu haaste" ? customChallenge : selectedChallenge,
      valueForCompany,
      hackathonFocus
    };

    setData({
      ...data,
      submissions: [submission, ...data.submissions]
    });

    setTab("tulokset");
  }

  return (
    <div style={{ padding: 40 }}>
      <h1>{data.settings.title}</h1>
      <p>{data.settings.subtitle}</p>

      {tab === "pelaa" && (
        <div>
          <h2>Rakenna idea</h2>

          <input
            placeholder="Ryhmä"
            value={groupName}
            onChange={(e) => setGroupName(e.target.value)}
          />

         
<input
  placeholder="Yritys (kenelle myisit hackathonin)"
  value={customCompany}
  onChange={(e) => setCustomCompany(e.target.value)}
/>
``


          <select onChange={(e) => setSelectedChallenge(e.target.value)}>
            <option>Valitse haaste</option>
            {data.challengeOptions.map((c) => (
              <option key={c}>{c}</option>
            ))}
            <option>Muu haaste</option>
          </select>
{selectedChallenge === "Muu haaste" && (
  <input
    placeholder="Kirjoita haaste"
    value={customChallenge}
    onChange={(e) => setCustomChallenge(e.target.value)}
  />
)}


          <textarea
            placeholder="Arvo yritykselle"
            onChange={(e) => setValueForCompany(e.target.value)}
          />

          <textarea
            placeholder="Hackathonin fokus"
            onChange={(e) => setHackathonFocus(e.target.value)}
          />

          <button onClick={saveSubmission}>Tallenna</button>
        </div>
      )}

      {tab === "tulokset" && (
        <div>
          <h2>Tulokset</h2>
          {data.submissions.map((s) => (
            <div key={s.id}>
              <strong>{s.company}</strong> – {s.challenge}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
``
