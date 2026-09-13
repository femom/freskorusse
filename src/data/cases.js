// Palette de couleurs associée à chaque cas (utilisée pour les badges, tags, accents visuels).
// Les 6 cas partagent désormais UNE seule famille de teinte (bleu-indigo, cohérente avec
// l'accent du module "Les cas") : seule la luminosité varie d'un cas à l'autre, pour rester
// facilement identifiable sans multiplier les couleurs différentes à l'écran.
// "c" = couleur principale (badges, texte de tag), "bg" = fond pâle partagé pour les tags.
const CASES_TAG_BG = "#E7EBF8";
export const caseColors = {
  nom:{c:"#073cff", bg:CASES_TAG_BG},
  gen:{c:"#ce5d3b", bg:CASES_TAG_BG},
  dat:{c:"#b89f2e", bg:CASES_TAG_BG},
  acc:{c:"#9b2b27", bg:CASES_TAG_BG},
  ins:{c:"#427e20", bg:CASES_TAG_BG},
  pre:{c:"#196659", bg:CASES_TAG_BG},
};
// Abréviation russe classique de chaque cas (affichée dans les badges : Им., Р., Д., В., Тв., Пр.)
export const caseAbbr = {nom:"Им.", gen:"Р.", dat:"Д.", acc:"В.", ins:"Тв.", pre:"Пр."};

// Règle générale "dur / mou" qui explique QUAND utiliser quelle variante de terminaison
// (ex: -а ou -я, -у ou -ю, -ы ou -и...). C'est la clé pour comprendre les tableaux ci-dessous :
// chaque terminaison a une version "dure" et une version "molle", jamais les deux au hasard.
export const hardSoftRule = {
  title: "Comment choisir entre les 2 terminaisons (dur / mou)",
  points: [
    "Un mot russe a un thème « dur » ou « mou ». C'est ce thème qui décide quelle terminaison utiliser — jamais les deux au choix.",
    "<b>Thème dur</b> → le mot se termine par une consonne dure (брат, город) ou par -а/-о/-у/-ы. Tu prends la terminaison <b>dure</b> : -а, -у, -ы, -ом, -е...",
    "<b>Thème mou</b> → le mot se termine par -й, -ь, ou par -я/-е/-ю/-и (учитель, дядя, время). Tu prends la terminaison <b>molle</b> : -я, -ю, -и, -ем, -е...",
    "<b>Règle d'orthographe à connaître</b> : après г, к, х, ж, ш, щ, ч, ц on n'écrit jamais -ы → on écrit toujours -и à la place (книга → книги, pas книгы).",
    "Autre règle utile : après ж, ш, ц, ч, щ, un -о non accentué s'écrit souvent -е (мужем mais мужчиной garde sa logique propre — retiens surtout la règle du -ы/-и, la plus fréquente)."
  ]
};

// Terminaisons de chaque cas, organisées par genre (M/F/N) et par pluriel (P).
// Pour l'accusatif, les formes des noms ANIMÉS sont explicitement notées (et pas seulement
// "= génitif") pour que la lettre finale soit visible directement dans le tableau.
export const endings = {
  nom: {M:["Ø (consonne)","-й, -ь"], F:["-а (-я)","-ь (3e groupe : дверь, ночь)"], N:["-о (-е)"], P:["-ы, -и (masc./fém.)","-а, -я (neutre)"]},
  gen: {M:["-а (-я)"], F:["-ы, -и"], N:["-а (-я)"], P:["-ов, -ев (masc.)","-ей (fém. en -ь, masc. mous)","Ø le plus souvent (книга → книг)"]},
  dat: {M:["-у (-ю)"], F:["-е","-и (fém. en -ь)"], N:["-у (-ю)"], P:["-ам, -ям"]},
  acc: {
    M:["Inanimé : Ø (identique au nominatif)", "Animé : -а (-я) (identique au génitif)"],
    F:["-у (-ю) — animé ou non, même terminaison", "Fém. en -ь : Ø (identique au nominatif)"],
    N:["Ø (identique au nominatif — quasi toujours, même animé)"],
    P:["Inanimé : -ы, -и / -а, -я (identique au nominatif pluriel)", "Animé : -ов, -ев, -ей, Ø (identique au génitif pluriel)"]
  },
  ins: {M:["-ом (-ем/-ём)"], F:["-ой (-ей/-ёй)","-ью (fém. en -ь)"], N:["-ом (-ем)"], P:["-ами, -ями"]},
  pre: {M:["-е","-и (mots en -ий, -ие)"], F:["-е","-и (fém. en -ь)"], N:["-е","-и (mots en -ие)"], P:["-ах, -ях"]},
};

// Notes correctives ponctuelles affichées sous le tableau des terminaisons d'un cas donné.
export const fixNotes = {
  acc: "Retiens surtout ceci : pour un être animé (personne, animal), l'accusatif emprunte toujours la forme du génitif — au singulier masculin ET au pluriel (tous genres). Pour un objet inanimé, il emprunte toujours la forme du nominatif.",
  ins: "Le féminin en -ь prend -ью (дверь → дверью), pas -ю seule.",
};

// ---------------------------------------------------------------------------
// Contenu pédagogique des 6 cas russes : usage, terminaisons, exemples et
// exercices de la leçon interactive. Consommé par src/pages/Cases.jsx.
// ---------------------------------------------------------------------------
export const cases = [
  {
    key:"nom", label:"Nominatif", ru:"именительный", questions:"кто? что?",
    usage:[
      "C'est la forme de base d'un nom — celle que tu trouves dans le dictionnaire.",
      "Il répond toujours à la fonction de <b>sujet</b> de la phrase : celui qui fait ou qui est.",
      "Aucune préposition ne s'utilise avec le nominatif."
    ],
    examples:[
      ["M","Брат работает дома.","brat ra-BO-ta-yit DO-ma","Le frère travaille à la maison.","Брат"],
      ["F","Сестра учится в школе.","sist-RA OO-chit-sya v SHKO-li","La sœur étudie à l'école.","Сестра"],
      ["N","Окно открыто.","ak-NO at-KRIY-ta","La fenêtre est ouverte.","Окно"],
      ["P","Друзья приходят вечером.","droo-ZYA pri-HO-dyat VYE-chi-ram","Les amis arrivent le soir.","Друзья"],
    ],
    exos:[
      {type:"type", prompt:"___ работает дома.", base:"брат — le frère · Nominatif, sujet", answer:["брат"]},
      {type:"mcq", prompt:"Кто читает книгу?", base:"Nominatif, sujet", options:["студент","студента","студенту"], answer:["студент"]},
      {type:"type", prompt:"___ учится в школе.", base:"сестра — la sœur · Nominatif, sujet", answer:["сестра"]},
      {type:"mcq", prompt:"Что лежит на столе?", base:"Nominatif, sujet", options:["книга","книгу","книги"], answer:["книга"]},
      {type:"type", prompt:"___ открыто.", base:"окно — la fenêtre · Nominatif, sujet", answer:["окно"]},
      {type:"mcq", prompt:"Что там?", base:"Nominatif, sujet", options:["письмо","письма","письму"], answer:["письмо"]},
      {type:"type", prompt:"___ приходят вечером.", base:"друзья — les amis · Nominatif pluriel", answer:["друзья"]},
      {type:"mcq", prompt:"Кто здесь?", base:"Nominatif pluriel", options:["студенты","студентов","студентам"], answer:["студенты"]},
      {type:"type", prompt:"___ большой.", base:"город — la ville · Nominatif, sujet", answer:["город"]},
      {type:"type", prompt:"___ едет быстро.", base:"машина — la voiture · Nominatif, sujet", answer:["машина"]},
    ]
  },
  {
    key:"gen", label:"Génitif", ru:"родительный", questions:"кого? чего?",
    usage:[
      "Exprime la <b>possession</b> (« de ») : дом брата = la maison du frère.",
      "Exprime l'<b>absence</b> avec «нет» : у меня нет книги = je n'ai pas de livre.",
      "Exprime une <b>quantité</b> : стакан воды = un verre d'eau.",
      "Obligatoire après без, до, из, у, от, для, с (« depuis »)."
    ],
    examples:[
      ["M","У меня нет брата.","oo mi-NYA nyet BRA-ta","Je n'ai pas de frère.","брата"],
      ["F","Это книга сестры.","E-ta KNEE-ga sist-RIY","C'est le livre de la sœur.","сестры"],
      ["N","Цвет окна белый.","tsvyet ak-NA BYE-liy","La couleur de la fenêtre est blanche.","окна"],
      ["P","У меня нет друзей здесь.","oo mi-NYA nyet droo-ZYEY zdyes'","Je n'ai pas d'amis ici.","друзей"],
    ],
    exos:[
      {type:"type", prompt:"У меня нет ___.", base:"брат · Génitif après «нет»", answer:["брата"]},
      {type:"mcq", prompt:"Это дом ___.", base:"Génitif de possession", options:["брата","брату","братом"], answer:["брата"]},
      {type:"type", prompt:"Это книга ___.", base:"сестра · Génitif de possession", answer:["сестры"]},
      {type:"mcq", prompt:"Стакан ___.", base:"Génitif de quantité", options:["воды","вода","воду"], answer:["воды"]},
      {type:"type", prompt:"Цвет ___ белый.", base:"окно · Génitif de possession", answer:["окна"]},
      {type:"mcq", prompt:"У меня нет ___.", base:"Génitif après «нет»", options:["письма","письмо","письму"], answer:["письма"]},
      {type:"type", prompt:"У меня нет ___.", base:"друзья → друзей · Génitif pluriel", answer:["друзей"]},
      {type:"mcq", prompt:"Много ___.", base:"Génitif pluriel de quantité", options:["студентов","студенты","студентам"], answer:["студентов"]},
      {type:"type", prompt:"Дом ___.", base:"врач · Génitif de possession", answer:["врача"]},
      {type:"type", prompt:"Без ___.", base:"школа · Génitif après «без»", answer:["школы"]},
    ]
  },
  {
    key:"dat", label:"Datif", ru:"дательный", questions:"кому? чему?",
    usage:[
      "Indique le <b>destinataire</b> de l'action (« à ») : я дал книгу другу.",
      "Verbes fréquents au datif : дать, помочь, звонить, писать.",
      "Prépositions к (vers) et по (le long de, selon).",
      "Tournures impersonnelles : мне холодно = j'ai froid."
    ],
    examples:[
      ["M","Я звоню брату.","ya zva-NYOO BRA-too","J'appelle mon frère.","брату"],
      ["F","Я пишу сестре.","ya pi-SHOO sist-RYE","J'écris à ma sœur.","сестре"],
      ["N","Я рад письму.","ya rat pis'-MOO","Je suis content de la lettre.","письму"],
      ["P","Я звоню друзьям.","ya zva-NYOO drooz'-YAM","J'appelle mes amis.","друзьям"],
    ],
    exos:[
      {type:"type", prompt:"Я звоню ___.", base:"брат · Datif, destinataire", answer:["брату"]},
      {type:"mcq", prompt:"Мы идём к ___.", base:"Datif après «к»", options:["врачу","врача","врачом"], answer:["врачу"]},
      {type:"type", prompt:"Я пишу ___.", base:"сестра · Datif, destinataire", answer:["сестре"]},
      {type:"mcq", prompt:"Я звоню ___.", base:"Datif, destinataire", options:["школе","школу","школы"], answer:["школе"]},
      {type:"type", prompt:"Я рад ___.", base:"письмо · Datif après «рад»", answer:["письму"]},
      {type:"mcq", prompt:"Он рад ___.", base:"Datif après «рад»", options:["молоку","молоко","молока"], answer:["молоку"]},
      {type:"type", prompt:"Я звоню ___.", base:"друзья · Datif pluriel", answer:["друзьям"]},
      {type:"mcq", prompt:"Мы помогаем ___.", base:"Datif pluriel, destinataire", options:["студентам","студентов","студенты"], answer:["студентам"]},
      {type:"type", prompt:"Дай ___ книгу.", base:"студент · Datif, destinataire", answer:["студенту"]},
      {type:"type", prompt:"Спасибо ___.", base:"сестра · Datif, destinataire", answer:["сестре"]},
    ]
  },
  {
    key:"acc", label:"Accusatif", ru:"винительный", questions:"кого? что?",
    usage:[
      "Marque le <b>complément d'objet direct</b> : я читаю книгу.",
      "Marque aussi la <b>direction</b> avec в/на + verbe de mouvement : я иду в школу.",
      "Règle clé : être <b>animé</b> → l'accusatif copie le génitif (я вижу брата). Objet <b>inanimé</b> → il copie le nominatif."
    ],
    examples:[
      ["M inanimé","Я вижу город.","ya VEE-zhoo GO-rat","Je vois la ville.","город"],
      ["M animé","Я вижу брата.","ya VEE-zhoo BRA-ta","Je vois mon frère.","брата"],
      ["F","Я читаю книгу.","ya chi-TA-yoo KNEE-goo","Je lis un livre.","книгу"],
      ["N","Я открываю окно.","ya at-kriy-VA-yoo ak-NO","J'ouvre la fenêtre.","окно"],
    ],
    exos:[
      {type:"type", prompt:"Я вижу ___.", base:"город (inanimé) · Accusatif = nominatif", answer:["город"]},
      {type:"type", prompt:"Я вижу ___.", base:"брат (animé) · Accusatif = génitif", answer:["брата"]},
      {type:"mcq", prompt:"Я знаю ___.", base:"Accusatif = génitif (animé)", options:["студента","студент","студенту"], answer:["студента"]},
      {type:"type", prompt:"Я читаю ___.", base:"книга · Accusatif féminin -у", answer:["книгу"]},
      {type:"mcq", prompt:"Она любит ___.", base:"Accusatif féminin -у", options:["музыку","музыка","музыки"], answer:["музыку"]},
      {type:"type", prompt:"Я открываю ___.", base:"окно · Accusatif neutre = nominatif", answer:["окно"]},
      {type:"mcq", prompt:"Я пью ___.", base:"Accusatif neutre = nominatif", options:["молоко","молока","молоку"], answer:["молоко"]},
      {type:"type", prompt:"Я читаю ___.", base:"книги (pluriel, inanimé) · Accusatif = nominatif", answer:["книги"]},
      {type:"type", prompt:"Я вижу ___.", base:"друзья (animé pluriel) · Accusatif = génitif", answer:["друзей"]},
      {type:"mcq", prompt:"Мы знаем ___.", base:"Accusatif pluriel = génitif (animé)", options:["студентов","студенты","студентам"], answer:["студентов"]},
    ]
  },
  {
    key:"ins", label:"Instrumental", ru:"творительный", questions:"кем? чем?",
    usage:[
      "Indique le <b>moyen</b> (« avec, au moyen de ») : я пишу ручкой.",
      "Marque l'<b>accompagnement</b> avec с : я еду с другом.",
      "S'utilise après быть/стать pour une <b>profession</b> : она стала врачом."
    ],
    examples:[
      ["M","Он работает врачом.","on ra-BO-ta-yit vra-CHOM","Il travaille comme médecin.","врачом"],
      ["F","Я горжусь сестрой.","ya gar-ZHOOS sist-ROY","Je suis fier de ma sœur.","сестрой"],
      ["N","Он доволен письмом.","on da-VO-lin pis'-MOM","Il est content de la lettre.","письмом"],
      ["P","Я говорю с друзьями.","ya ga-va-RYOO z drooz'-YA-mi","Je parle avec mes amis.","друзьями"],
    ],
    exos:[
      {type:"type", prompt:"Он работает ___.", base:"врач (profession) · Instrumental", answer:["врачом"]},
      {type:"mcq", prompt:"Я горжусь ___.", base:"Instrumental après «горжусь»", options:["братом","брата","брату"], answer:["братом"]},
      {type:"type", prompt:"Я горжусь ___.", base:"сестра · Instrumental féminin -ой", answer:["сестрой"]},
      {type:"mcq", prompt:"Я довольна ___.", base:"Instrumental féminin -ой", options:["школой","школу","школы"], answer:["школой"]},
      {type:"type", prompt:"Он доволен ___.", base:"письмо · Instrumental neutre -ом", answer:["письмом"]},
      {type:"mcq", prompt:"Мы недовольны ___.", base:"Instrumental neutre -ом", options:["окном","окно","окна"], answer:["окном"]},
      {type:"type", prompt:"Я говорю с ___.", base:"друзья · Instrumental pluriel -ями", answer:["друзьями"]},
      {type:"mcq", prompt:"Он гордится ___.", base:"Instrumental pluriel -ами", options:["студентами","студентов","студентам"], answer:["студентами"]},
      {type:"type", prompt:"Я еду с ___.", base:"друг · Instrumental après «с»", answer:["другом"]},
      {type:"type", prompt:"Он доволен ___.", base:"книга · Instrumental féminin -ой", answer:["книгой"]},
    ]
  },
  {
    key:"pre", label:"Prépositionnel", ru:"предложный", questions:"о ком? о чём? где?",
    usage:[
      "Le seul cas qui s'utilise <b>toujours</b> avec une préposition : о, в, на.",
      "Sert à parler d'un <b>sujet de discussion</b> : я думаю о тебе.",
      "Sert aussi à indiquer un <b>lieu</b> sans mouvement : я живу в городе."
    ],
    examples:[
      ["M","Мы говорим о брате.","miy ga-va-REEM a BRA-ti","Nous parlons de mon frère.","брате"],
      ["F","Мы говорим о сестре.","miy ga-va-REEM a sist-RYE","Nous parlons de ma sœur.","сестре"],
      ["N","Мы говорим о письме.","miy ga-va-REEM a pis'-MYE","Nous parlons de la lettre.","письме"],
      ["P","Мы говорим о друзьях.","miy ga-va-REEM a drooz'-YAH","Nous parlons de nos amis.","друзьях"],
    ],
    exos:[
      {type:"type", prompt:"Мы говорим о ___.", base:"брат · Prépositionnel après «о»", answer:["брате"]},
      {type:"mcq", prompt:"Я живу в ___.", base:"Prépositionnel de lieu", options:["городе","город","города"], answer:["городе"]},
      {type:"type", prompt:"Мы говорим о ___.", base:"сестра · Prépositionnel après «о»", answer:["сестре"]},
      {type:"mcq", prompt:"Она учится в ___.", base:"Prépositionnel de lieu", options:["школе","школу","школы"], answer:["школе"]},
      {type:"type", prompt:"Мы говорим о ___.", base:"письмо · Prépositionnel après «о»", answer:["письме"]},
      {type:"mcq", prompt:"Мы читаем о ___.", base:"Prépositionnel après «о»", options:["молоке","молоко","молока"], answer:["молоке"]},
      {type:"type", prompt:"Мы говорим о ___.", base:"друзья · Prépositionnel pluriel -ях", answer:["друзьях"]},
      {type:"mcq", prompt:"Мы думаем о ___.", base:"Prépositionnel pluriel -ах", options:["студентах","студентов","студентам"], answer:["студентах"]},
      {type:"type", prompt:"Я думаю о ___.", base:"врач · Prépositionnel après «о»", answer:["враче"]},
      {type:"type", prompt:"Он рассказывает о ___.", base:"машина · Prépositionnel après «о»", answer:["машине"]},
    ]
  },
];
