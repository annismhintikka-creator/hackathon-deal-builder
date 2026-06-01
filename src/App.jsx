
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
    "Ratkaisun pitäisi toimia myös pk-yritykselle",
    "Tiimiin tulee mukaan opiskelijoita eri aloilta",
    "Budjetti on pieni, mutta näkyvyys suuri",
    "Yrityksellä ei ole vielä selkeää ongelmamäärittelyä"
  ],
  submissions: [],
  votes: {},
  settings: {
    title: "Hackathon Deal Builder",
    subtitle:
      "Nimeä yritys, määritä haaste ja perustele, miksi juuri hackathon on oikea palvelu.",
    timerMinutes: 15
  }
};

function uid() {
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

function cls(...arr) {
  return arr.filter(Boolean).join(" ");
}

function downloadTextFile(filename, content, mime = "text/plain;charset=utf-8") {
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

function toCsv(rows) {
  const escape = (value) => {
    const s = String(value ?? "");
    if (/[",\
]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
    return s;
  };
  return rows.map((row) => row.map(escape).join(",")).join("\
");
}

function Badge({ children, active, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cls(
        "rounded-full border px-3 py-1 text-sm transition",
        active
          ? "border-emerald-700 bg-emerald-700 text-white"
          : "border-slate-300 bg-white text-slate-700 hover:border-emerald-400 hover:text-emerald-700"
      )}
    >
      {children}
    </button>
  );
}

function SectionCard({ title, subtitle, right, children }) {
  return (
    <div className="rounded-3xl bg-white shadow-sm ring-1 ring-slate-200">
      <div className="flex items-start justify-between gap-4 border-b border-slate-100 px-6 py-5">
        <div>
          <h2 className="text-xl font-semibold text-slate-900">{title}</h2>
          {subtitle ? <p className="mt-1 text-sm text-slate-600">{subtitle}</p> : null}
        </div>
        {right}
      </div>
      <div className="px-6 py-5">{children}</div>
    </div>
  );
}

function SmallInput({ label, value, onChange, placeholder }) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-medium text-slate-700">{label}</span>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full rounded-2xl border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
      />
    </label>
  );
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
  const [bonusCard, setBonusCard] = useState("");
  const [newCompany, setNewCompany] = useState("");
  const [newChallenge, setNewChallenge] = useState("");
  const [newBonus, setNewBonus] = useState("");
  const [secondsLeft, setSecondsLeft] = useState(defaultData.settings.timerMinutes * 60);
  const [timerRunning, setTimerRunning] = useState(false);
  const [facilitatorNote, setFacilitatorNote] = useState("");
  const [viewMode, setViewMode] = useState("galleria");

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        const merged = {
          ...defaultData,
          ...parsed,
          settings: { ...defaultData.settings, ...(parsed.settings || {}) }
        };
        setData(merged);
        setSecondsLeft((merged.settings.timerMinutes || 15) * 60);
      }
    } catch (e) {
      console.error(e);
    }
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch (e) {
      console.error(e);
    }
  }, [data]);

  useEffect(() => {
    if (!timerRunning) return;
    const id = setInterval(() => {
      setSecondsLeft((s) => {
        if (s <= 1) {
          clearInterval(id);
          setTimerRunning(false);
          return 0;
        }
        return s - 1;
      });
    }, 1000);
    return () => clearInterval(id);
  }, [timerRunning]);

  const companyName = selectedCompany === "Muu verkoston yritys" ? customCompany.trim() : selectedCompany;
  const challengeName = selectedChallenge === "Muu haaste" ? customChallenge.trim() : selectedChallenge;

  const totalVotes = useMemo(
    () => Object.values(data.votes || {}).reduce((sum, n) => sum + Number(n || 0), 0),
    [data.votes]
  );

  const rankedSubmissions = useMemo(() => {
    return [...(data.submissions || [])].sort((a, b) => {
      const av = data.votes?.[a.id] || 0;
      const bv = data.votes?.[b.id] || 0;
      if (bv !== av) return bv - av;
      return (a.company || "").localeCompare(b.company || "", "fi");
    });
  }, [data.submissions, data.votes]);

  function spinBonusCard() {
    if (!data.bonusCards.length) return;
    const next = data.bonusCards[Math.floor(Math.random() * data.bonusCards.length)];
    setBonusCard(next);
  }

  function resetForm(keepGroup = true) {
    setSelectedCompany("");
    setCustomCompany("");
    setSelectedChallenge("");
    setCustomChallenge("");
    setSelectedReasons([]);
    setValueForCompany("");
    setHackathonFocus("");
    setBonusCard("");
    if (!keepGroup) setGroupName("");
  }

  function toggleReason(reason) {
    setSelectedReasons((prev) =>
      prev.includes(reason) ? prev.filter((r) => r !== reason) : [...prev, reason]
    );
  }

  function addOption(kind, value) {
    const v = value.trim();
    if (!v) return;
    setData((prev) => {
      const key = kind === "yritys" ? "companyOptions" : kind === "haaste" ? "challengeOptions" : "bonusCards";
      const list = prev[key] || [];
      if (list.includes(v)) return prev;
      return { ...prev, [key]: [...list, v] };
    });
    if (kind === "yritys") setNewCompany("");
    if (kind === "haaste") setNewChallenge("");
    if (kind === "bonus") setNewBonus("");
  }

  function removeOption(kind, value) {
    setData((prev) => {
      const key = kind === "yritys" ? "companyOptions" : kind === "haaste" ? "challengeOptions" : "bonusCards";
      return { ...prev, [key]: (prev[key] || []).filter((x) => x !== value) };
    });
  }

  function saveSubmission() {
    if (!companyName || !challengeName || !valueForCompany.trim() || !hackathonFocus.trim()) {
      alert("Täytä ainakin yritys, haaste, arvo yritykselle ja hackathonin fokus.");
      return;
    }
    const submission = {
      id: uid(),
      createdAt: new Date().toISOString(),
      groupName: groupName.trim() || "Ryhmä ilman nimeä",
      company: companyName,
      challenge: challengeName,
      reasons: selectedReasons,
      valueForCompany: valueForCompany.trim(),
      hackathonFocus: hackathonFocus.trim(),
      bonusCard: bonusCard || "Ei bonuskorttia",
      facilitatorNote: facilitatorNote.trim()
    };
    setData((prev) => ({
      ...prev,
      submissions: [submission, ...(prev.submissions || [])]
    }));
    resetForm(true);
    setTab("aanestys");
  }

  function changeVote(id, delta) {
    setData((prev) => ({
      ...prev,
      votes: {
        ...(prev.votes || {}),
        [id]: Math.max(0, (prev.votes?.[id] || 0) + delta)
      }
    }));
  }

  function exportCsv() {
    const rows = [
      [
        "Sijoitus",
        "Ääniä",
        "Ryhmä",
        "Yritys",
        "Haaste",
        "Miksi hackathon",
        "Arvo yritykselle",
        "Hackathonin fokus",
        "Bonuskortti",
        "Aika"
      ],
      ...rankedSubmissions.map((s, idx) => [
        idx + 1,
        data.votes?.[s.id] || 0,
        s.groupName,
        s.company,
        s.challenge,
        s.reasons.join(" | "),
        s.valueForCompany,
        s.hackathonFocus,
        s.bonusCard,
        s.createdAt
      ])
    ];
    downloadTextFile("hackathon_leadit.csv", toCsv(rows), "text/csv;charset=utf-8");
  }

  function exportJson() {
    downloadTextFile(
      "hackathon_deal_builder_data.json",
      JSON.stringify(data, null, 2),
      "application/json;charset=utf-8"
    );
  }

  function resetAll() {
    if (!window.confirm("Tyhjennetäänkö kaikki ideat, äänet ja asetukset?")) return;
    setData(defaultData);
    setSecondsLeft(defaultData.settings.timerMinutes * 60);
    setTimerRunning(false);
    resetForm(false);
    setFacilitatorNote("");
    setTab("pelaa");
  }

  function applyTimerSettings(nextMinutes) {
    const minutes = Math.max(1, Number(nextMinutes || 15));
    setData((prev) => ({ ...prev, settings: { ...prev.settings, timerMinutes: minutes } }));
    setSecondsLeft(minutes * 60);
    setTimerRunning(false);
  }

  const minutes = String(Math.floor(secondsLeft / 60)).padStart(2, "0");
  const seconds = String(secondsLeft % 60).padStart(2, "0");

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <div className="mx-auto max-w-7xl px-4 py-6 md:px-8 md:py-8">
        <div className="mb-6 rounded-[2rem] bg-gradient-to-br from-emerald-700 via-emerald-600 to-teal-600 p-6 text-white shadow-lg md:p-8">
          <div className="grid gap-6 md:grid-cols-[1.5fr,0.9fr] md:items-end">
            <div>
              <p className="mb-2 text-sm uppercase tracking-[0.2em] text-emerald-100">BTI / BioBoosters</p>
              <h1 className="text-3xl font-bold md:text-4xl">{data.settings.title}</h1>
              <p className="mt-3 max-w-3xl text-sm leading-6 text-emerald-50 md:text-base">
                {data.settings.subtitle}
              </p>
              <div className="mt-4 flex flex-wrap gap-2 text-sm text-emerald-50">
                <span className="rounded-full bg-white/15 px-3 py-1">Tavoite: nimetyt yritysliidit</span>
                <span className="rounded-full bg-white/15 px-3 py-1">Tulokset: yritys + haaste + arvo + fokus</span>
                <span className="rounded-full bg-white/15 px-3 py-1">Käyttö: selaimessa</span>
              </div>
            </div>

            <div className="rounded-3xl bg-white/10 p-5 backdrop-blur-sm ring-1 ring-white/20">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-emerald-50">Fasilitaattorin ajastin</p>
                  <p className="text-4xl font-bold tabular-nums md:text-5xl">{minutes}:{seconds}</p>
                </div>
                <div className="text-right text-sm text-emerald-50">
                  <div>Ideoita: <span className="font-semibold text-white">{data.submissions.length}</span></div>
                  <div>Ääniä: <span className="font-semibold text-white">{totalVotes}</span></div>
                </div>
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                <button
                  onClick={() => setTimerRunning((v) => !v)}
                  className="rounded-2xl bg-white px-4 py-2 text-sm font-medium text-emerald-700 shadow-sm hover:bg-emerald-50"
                >
                  {timerRunning ? "Pysäytä" : "Käynnistä"}
                </button>
                <button
                  onClick={() => {
                    setTimerRunning(false);
                    setSecondsLeft((data.settings.timerMinutes || 15) * 60);
                  }}
                  className="rounded-2xl bg-white/15 px-4 py-2 text-sm font-medium text-white ring-1 ring-white/20 hover:bg-white/20"
                >
                  Nollaa
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="mb-6 flex flex-wrap gap-2">
          {[
            ["pelaa", "Pelaa"],
            ["aanestys", "Äänestys"],
            ["tulokset", "Tulokset"],
            ["asetukset", "Asetukset"]
          ].map(([key, label]) => (
            <button
              key={key}
              onClick={() => setTab(key)}
              className={cls(
                "rounded-full px-4 py-2 text-sm font-medium transition",
                tab === key
                  ? "bg-slate-900 text-white"
                  : "bg-white text-slate-700 ring-1 ring-slate-200 hover:bg-slate-100"
              )}
            >
              {label}
            </button>
          ))}
        </div>

        {tab === "pelaa" && (
          <div className="grid gap-6 lg:grid-cols-[1.15fr,0.85fr]">
            <SectionCard
              title="Rakenna uusi diili"
              subtitle="Nimeä yritys verkostosta, määritä haaste ja tee siitä myytävä hackathon-case."
              right={
                <button
                  onClick={spinBonusCard}
                  className="rounded-2xl bg-emerald-700 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-800"
                >
                  Arvo bonuskortti
                </button>
              }
            >
              <div className="grid gap-5 md:grid-cols-2">
                <SmallInput
                  label="Ryhmä / osallistuja"
                  value={groupName}
                  onChange={setGroupName}
                  placeholder="Esim. Kiertotalous-tiimi"
                />
                <label className="block md:col-span-2">
                  <span className="mb-2 block text-sm font-medium text-slate-700">Yritys (pakollinen)</span>
                  <select
                    value={selectedCompany}
                    onChange={(e) => setSelectedCompany(e.target.value)}
                    className="w-full rounded-2xl border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
                  >
                    <option value="">Valitse yritys</option>
                    {data.companyOptions.map((company) => (
                      <option key={company} value={company}>{company}</option>
                    ))}
                  </select>
                </label>

                {selectedCompany === "Muu verkoston yritys" && (
                  <div className="md:col-span-2">
                    <SmallInput
                      label="Kirjoita yrityksen nimi"
                      value={customCompany}
                      onChange={setCustomCompany}
                      placeholder="Esim. verkoston pk-yritys tai startup"
                    />
                  </div>
                )}

                <label className="block md:col-span-2">
                  <span className="mb-2 block text-sm font-medium text-slate-700">Haaste</span>
                  <select
                    value={selectedChallenge}
                    onChange={(e) => setSelectedChallenge(e.target.value)}
                    className="w-full rounded-2xl border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
                  >
                    <option value="">Valitse haaste</option>
                    {data.challengeOptions.map((challenge) => (
                      <option key={challenge} value={challenge}>{challenge}</option>
                    ))}
                    <option value="Muu haaste">Muu haaste</option>
                  </select>
                </label>

                {selectedChallenge === "Muu haaste" && (
                  <div className="md:col-span-2">
                    <SmallInput
                      label="Kirjoita haaste"
                      value={customChallenge}
                      onChange={setCustomChallenge}
                      placeholder="Esim. biotalouden kestävyysongelma"
                    />
                  </div>
                )}

                <div className="md:col-span-2">
                  <span className="mb-2 block text-sm font-medium text-slate-700">Miksi juuri hackathon?</span>
                  <div className="flex flex-wrap gap-2">
                    {data.reasons.map((reason) => (
                      <Badge key={reason} active={selectedReasons.includes(reason)} onClick={() => toggleReason(reason)}>
                        {reason}
                      </Badge>
                    ))}
                  </div>
                </div>

                <label className="block md:col-span-2">
                  <span className="mb-2 block text-sm font-medium text-slate-700">Arvo yritykselle</span>
                  <textarea
                    value={valueForCompany}
                    onChange={(e) => setValueForCompany(e.target.value)}
                    rows={3}
                    placeholder="Esim. nopea tapa löytää 3 pilotointikelpoista ideaa sivuvirran hyödyntämiseen."
                    className="w-full rounded-2xl border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
                  />
                </label>

                <label className="block md:col-span-2">
                  <span className="mb-2 block text-sm font-medium text-slate-700">Hackathonin fokus</span>
                  <textarea
                    value={hackathonFocus}
                    onChange={(e) => setHackathonFocus(e.target.value)}
                    rows={3}
                    placeholder="Esim. 48 tunnissa 3 konseptia ja yksi jatkopilotin ehdotus."
                    className="w-full rounded-2xl border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
                  />
                </label>

                <label className="block md:col-span-2">
                  <span className="mb-2 block text-sm font-medium text-slate-700">Fasilitaattorin muistiinpano (valinnainen)</span>
                  <input
                    value={facilitatorNote}
                    onChange={(e) => setFacilitatorNote(e.target.value)}
                    placeholder="Esim. kiinnostava BTI-yhteys tai jatkotoimenpide"
                    className="w-full rounded-2xl border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
                  />
                </label>
              </div>

              <div className="mt-5 flex flex-wrap gap-3">
                <button
                  onClick={saveSubmission}
                  className="rounded-2xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white hover:bg-slate-800"
                >
                  Tallenna idea äänestykseen
                </button>
                <button
                  onClick={() => resetForm(true)}
                  className="rounded-2xl bg-white px-5 py-3 text-sm font-medium text-slate-700 ring-1 ring-slate-300 hover:bg-slate-100"
                >
                  Tyhjennä lomake
                </button>
              </div>
            </SectionCard>

            <div className="space-y-6">
              <SectionCard title="Bonuskortti" subtitle="Pakota ryhmä ajattelemaan realistisemmin tai luovemmin.">
                <div className="min-h-[160px] rounded-[2rem] border-2 border-dashed border-emerald-300 bg-emerald-50 p-5">
                  {bonusCard ? (
                    <>
                      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-700">Tämän kierroksen bonus</p>
                      <p className="mt-3 text-2xl font-bold text-slate-900">{bonusCard}</p>
                      <p className="mt-3 text-sm text-slate-700">
                        Tehtävä: rakenna diili niin, että tämä lisäehto on mukana – silti yrityksen pitäisi haluta ostaa hackathon.
                      </p>
                    </>
                  ) : (
                    <div className="flex h-full items-center justify-center text-center text-sm text-slate-600">
                      Arvo bonuskortti, jotta peliin tulee lisäkierre.
                    </div>
                  )}
                </div>
              </SectionCard>

              <SectionCard title="Fasilitaattorin pikaohje" subtitle="Voit näyttää tämän suoraan osallistujille.">

