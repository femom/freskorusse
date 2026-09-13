import React, { useState, useMemo } from "react";
import {
  verbs, groupColor, groupLabel, PRON, PAST_LBL,
  REGULAR_ENDING_LENGTHS, IRREGULAR_ENDING_LENGTHS, ASPECT_TAGLINE,
} from "../data/verbs.js";
import LessonEngine from "../components/LessonEngine.jsx";

// Construit dynamiquement la banque de questions pour la "leçon globale" des verbes,
// directement à partir des données de conjugaison (aucune question écrite à la main :
// si on ajoute un verbe dans data/verbs.js, il alimente automatiquement le quiz).
function buildQuestionPool(){
  const pool = [];
  verbs.forEach(v=>{
    if(v.imp.present){
      PRON.forEach((p,i)=> pool.push({type:"type", prompt:`${v.imp.ru} — présent — ${p}`, base:`${v.fr} (imperfectif)`, answer:[v.imp.present[i]]}));
    }
    if(v.imp.future){
      PRON.forEach((p,i)=> pool.push({type:"type", prompt:`${v.imp.ru} — futur — ${p}`, base:`${v.fr} (imperfectif)`, answer:[v.imp.future[i]]}));
    }
    if(v.perf){
      PRON.forEach((p,i)=> pool.push({type:"type", prompt:`${v.perf.ru} — futur — ${p}`, base:`${v.fr} (perfectif)`, answer:[v.perf.future[i]]}));
    }
    PAST_LBL.forEach((p,i)=> pool.push({type:"type", prompt:`${v.imp.ru} — passé — ${p}`, base:`${v.fr} (imperfectif)`, answer:[v.imp.past[i]]}));
    if(v.perf){
      PAST_LBL.forEach((p,i)=> pool.push({type:"type", prompt:`${v.perf.ru} — passé — ${p}`, base:`${v.fr} (perfectif)`, answer:[v.perf.past[i]]}));
    }
  });
  return pool;
}
const questionPool = buildQuestionPool();
function shuffle(arr){ const a=arr.slice(); for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]];} return a; }

// ---------------------------------------------------------------------------
// Découpage "radical / terminaison" pour la coloration des tableaux, façon
// document "Parle Russe" : seule la terminaison personnelle est colorée.
//
// On se base sur la LONGUEUR de la terminaison à chaque position (я, ты, он...),
// pas sur une analyse linguistique complète — une mutation de consonne dans le
// radical (мочь : могу/можешь) ne change jamais le nombre de lettres de la
// terminaison, donc cette approche simple suffit pour tous les verbes réguliers.
// Voir data/verbs.js pour REGULAR_ENDING_LENGTHS et les 2-3 exceptions notées
// dans IRREGULAR_ENDING_LENGTHS (есть, съесть, дать).
function splitEnding(word, personIndex, ruLabelForOverride){
  const lengths = IRREGULAR_ENDING_LENGTHS[ruLabelForOverride] || REGULAR_ENDING_LENGTHS;
  const n = Math.min(lengths[personIndex], word.length - 1); // -1 : jamais tout le mot
  const cut = word.length - n;
  return { stem: word.slice(0, cut), ending: word.slice(cut) };
}

// Découpage pour le passé : la terminaison est -л / -ла / -ло / -ли dans la
// grande majorité des cas. Quelques verbes (мог, помог...) perdent le л au
// masculin — dans ce cas on ne colore rien plutôt que de risquer une coupe fausse.
function splitPastEnding(word){
  if(word.endsWith("ла") || word.endsWith("ло") || word.endsWith("ли")){
    return { stem: word.slice(0, -2), ending: word.slice(-2) };
  }
  if(word.endsWith("л")){
    return { stem: word.slice(0, -1), ending: "л" };
  }
  return { stem: word, ending: "" };
}

// Affiche un mot russe avec sa terminaison mise en couleur (span dédié).
function Highlighted({ stem, ending, color }){
  return <>{stem}<span style={{color}}>{ending}</span></>;
}

// Une ligne "pronom -> forme conjuguée" pour le présent ou le futur, avec la
// terminaison personnelle colorée.
function ConjRow({ pron, word, personIndex, ruLabel, color }){
  const { stem, ending } = splitEnding(word, personIndex, ruLabel);
  return (
    <div className="conj-row">
      <span className="pron">{pron}</span>
      <span className="form"><Highlighted stem={stem} ending={ending} color={color} /></span>
    </div>
  );
}

// Une ligne du passé (groupée par genre/nombre), terminaison colorée.
function PastRow({ pron, word, color }){
  const { stem, ending } = splitPastEnding(word);
  return (
    <div className="conj-row">
      <span className="pron">{pron}</span>
      <span className="form"><Highlighted stem={stem} ending={ending} color={color} /></span>
    </div>
  );
}

// Page "Conjugaison". Comme pour les cas : sans sélection -> liste + leçon globale,
// avec sélection -> détail complet d'un verbe (présent, futur, passé).
export default function Verbs({ selected, onSelect, addXp }){
  const [lessonOpen, setLessonOpen] = useState(false);
  const [filter, setFilter] = useState("");
  const active = verbs.find(v=>v.id===selected);
  const filtered = useMemo(()=>{
    const f = filter.trim().toLowerCase();
    if(!f) return verbs;
    return verbs.filter(v=> v.fr.toLowerCase().includes(f) || v.imp.ru.toLowerCase().includes(f) || (v.perf && v.perf.ru.toLowerCase().includes(f)));
  }, [filter]);

  const globalQuestions = useMemo(()=> shuffle(questionPool).slice(0,12), [lessonOpen]);

  // --- Vue d'ensemble (aucun verbe sélectionné) -------------------------------
  if(!active){
    return (
      <section>
        <h1 className="title">Les verbes russes</h1>
        <p className="subtitle">30 verbes essentiels — clique sur un verbe pour voir sa conjugaison complète.</p>

        <div className="lesson-launch" style={{"--lesson-accent":"var(--accent-verbs)"}}>
          <div className="info">
            <h4>Leçon interactive</h4>
            <p>12 questions tirées au hasard parmi les 30 verbes. 3 vies.</p>
          </div>
          <button className="btn-start" onClick={()=> setLessonOpen(true)}>Démarrer la leçon ▶</button>
        </div>

        <h3 className="block-title">Comment lire les tableaux</h3>
        <div className="card usage-card">
          <p><b>Imperfectif</b> = action habituelle, en cours, répétée. Il a un présent, et son futur se construit avec буду/будешь… + l'infinitif.</p>
          <p><b>Perfectif</b> = action ponctuelle, achevée, avec un résultat. Il n'a pas de présent — sa forme conjuguée exprime directement le futur.</p>
          <p>Dans les tableaux, seule la <b>terminaison</b> (la partie qui change selon la personne) est colorée — le radical reste neutre.</p>
        </div>

        <h3 className="block-title">Tous les verbes ({verbs.length})</h3>
        <input className="search-box" style={{marginBottom:14, maxWidth:320}} placeholder="Filtrer les verbes..." value={filter} onChange={e=>setFilter(e.target.value)}/>
        <div className="verb-cards">
          {filtered.map(v=>(
            <div className="card verb-card" key={v.id} onClick={()=> onSelect(v.id)}>
              <span className="badge" style={{background:groupColor[v.imp.group]}}>{v.imp.group === "irr" ? "!" : v.imp.group}</span>
              <div><div className="fr">{v.fr}</div><div className="ru">{v.imp.ru}{v.perf ? " / "+v.perf.ru : ""}</div></div>
            </div>
          ))}
        </div>

        {lessonOpen && (
          <LessonEngine
            questions={globalQuestions}
            title="Conjugaison"
            accent="var(--accent-verbs)"
            onClose={()=> setLessonOpen(false)}
            onFinish={(xp)=> addXp(xp)}
          />
        )}
      </section>
    );
  }

  // --- Détail d'un verbe précis ------------------------------------------------
  const col = groupColor[active.imp.group];
  // Le futur composé de l'imperfectif (буду/будешь...) n'est jamais "coupé" :
  // on colore l'auxiliaire en entier (c'est lui qui porte toute la conjugaison),
  // l'infinitif est affiché une seule fois, au centre, comme dans le document source.
  const AUX_FUTURE = ["буду","будешь","будет","будем","будете","будут"];

  return (
    <section>
      <div className="verb-header">
        {/* Icône thématique à la place d'une photo : garde l'app 100% hors-ligne
            et évite de réutiliser des images qui ne nous appartiennent pas. */}
        <span className="verb-icon-frame">{active.icon || "📌"}</span>
        <div>
          <h2 className="verb-name">{active.fr}</h2>
          <div className="verb-sub">{active.imp.ru}{active.perf ? ` (imperfectif) — ${active.perf.ru} (perfectif)` : " (imperfectif seul)"}</div>
        </div>
      </div>

      {active.note && <div className="aspect-note">{active.note}</div>}

      {/* --- Présent : uniquement l'imperfectif, terminaison colorée --- */}
      {active.imp.present && (
        <div className="tense-block">
          <div className="tense-title">Présent</div>
          <div className="conj-col conj-col-solo">
            <div className="aspect-label">{active.imp.ru} · {groupLabel[active.imp.group]}</div>
            {active.imp.present.map((form,i)=>(
              <ConjRow key={i} pron={PRON[i]} word={form} personIndex={i} ruLabel={active.imp.ru} color={col}/>
            ))}
          </div>
          <div className="full-note">Seul l'imperfectif a un présent — le perfectif n'en a pas.</div>
        </div>
      )}

      {/* --- Futur : 2 colonnes, infinitif affiché une seule fois au centre --- */}
      <div className="tense-block">
        <div className="tense-title">Futur</div>
        <div className="conj-grid conj-grid-futur">
          <div className="conj-col">
            <div className="aspect-label">Imperfectif</div>
            <div className="aspect-tagline">{ASPECT_TAGLINE.imp}</div>
            {AUX_FUTURE.map((aux,i)=>(
              <div className="conj-row" key={i}>
                <span className="pron">{PRON[i]}</span>
                <span className="form" style={{color:col}}>{aux}</span>
              </div>
            ))}
          </div>

          <div className="conj-infinitive">{active.imp.ru.toLowerCase()}</div>

          {active.perf ? (
            <div className="conj-col">
              <div className="aspect-label">Perfectif</div>
              <div className="aspect-tagline">{ASPECT_TAGLINE.perf}</div>
              {active.perf.future.map((form,i)=>(
                <ConjRow key={i} pron={PRON[i]} word={form} personIndex={i} ruLabel={active.perf.ru} color={col}/>
              ))}
            </div>
          ) : (
            <div className="conj-col conj-col-empty">
              <div className="aspect-label">Perfectif</div>
              <p className="full-note">Ce verbe n'a pas de forme perfective d'usage courant.</p>
            </div>
          )}
        </div>
      </div>

      {/* --- Passé : 2 colonnes, groupées par genre, terminaison colorée --- */}
      <div className="tense-block">
        <div className="tense-title">Passé</div>
        <div className="conj-grid">
          <div className="conj-col">
            <div className="aspect-label">Imperfectif</div>
            <div className="aspect-tagline">{ASPECT_TAGLINE.imp}</div>
            {PAST_LBL.map((pron,i)=>(
              <PastRow key={i} pron={pron} word={active.imp.past[i]} color={col}/>
            ))}
          </div>
          {active.perf ? (
            <div className="conj-col">
              <div className="aspect-label">Perfectif</div>
              <div className="aspect-tagline">{ASPECT_TAGLINE.perf}</div>
              {PAST_LBL.map((pron,i)=>(
                <PastRow key={i} pron={pron} word={active.perf.past[i]} color={col}/>
              ))}
            </div>
          ) : (
            <div className="conj-col conj-col-empty">
              <div className="aspect-label">Perfectif</div>
              <p className="full-note">Ce verbe n'a pas de forme perfective d'usage courant.</p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
