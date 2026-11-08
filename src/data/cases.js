// ---------------------------------------------------------------------------
// Contenu pédagogique des 6 cas russes.
//
// Ce fichier contient les textes (rôles, questions, prépositions, règles) et la
// DESCRIPTION des tableaux. Les exemples des tableaux sont des mots (word) que
// l'interface décline avec le moteur src/lib/declension.js : la forme affichée
// ne peut donc pas contredire le moteur. tests/cases-data.test.js vérifie en
// plus que chaque terminaison annoncée existe vraiment dans la forme calculée.
// ---------------------------------------------------------------------------

// Couleur de chaque cas (reprise de l'affiche de référence : bleu, vert, orange,
// rouge, violet, turquoise). Elle sert aux badges et aux accents ; le texte coloré
// est dérivé de cette couleur par CSS pour rester lisible en clair comme en sombre.
export const caseColors = {
  nom: { c: "#1E6FD9" },
  gen: { c: "#2E9E4F" },
  dat: { c: "#E8801A" },
  acc: { c: "#D6245A" },
  ins: { c: "#7A4FD0" },
  pre: { c: "#13988C" },
};

// Abréviation russe classique de chaque cas (Им., Р., Д., В., Тв., Пр.)
export const caseAbbr = { nom: "Им.", gen: "Р.", dat: "Д.", acc: "В.", ins: "Тв.", pre: "Пр." };

// Étiquettes des lignes des tableaux.
export const genderLabels = { M: "Masculin", F: "Féminin", N: "Neutre", P: "Pluriel" };

// Règle générale « dur ou mou » : elle explique QUAND utiliser quelle variante d'une
// terminaison (-а ou -я, -у ou -ю, -ы ou -и...).
export const hardSoftRule = {
  title: "Comment choisir entre deux terminaisons (dur ou mou)",
  points: [
    "Chaque terminaison existe en deux versions : une dure et une molle. C'est la fin du mot qui décide, jamais ton choix.",
    "<b>Mot à thème dur</b> : il finit par une consonne (брат, город) ou par -а, -о. Tu prends la terminaison dure : -а, -у, -ы, -ом, -е.",
    "<b>Mot à thème mou</b> : il finit par -й, -ь, -я, -е (учитель, дядя, море). Tu prends la terminaison molle : -я, -ю, -и, -ем, -е.",
    "<b>Règle d'orthographe n° 1</b> : après г, к, х, ж, ш, щ, ч, on n'écrit jamais -ы, on écrit -и (книга → книги, et non книгы).",
    "<b>Règle d'orthographe n° 2</b> : après ж, ш, ч, щ, ц, on écrit -ем quand la terminaison n'est pas accentuée et -ом quand elle l'est (мужем, mais ножом)."
  ]
};

// Notes correctives affichées sous le tableau d'un cas donné.
export const fixNotes = {
  acc: "Retiens ceci : pour un être animé (personne, animal), l'accusatif copie le génitif, au masculin singulier et à tous les pluriels. Pour un objet inanimé, il copie le nominatif. Le féminin en -а a toujours sa propre terminaison (-у).",
  ins: "Le féminin en -ь prend -ью (дверь → дверью), pas -ю seule.",
  pre: "Le prépositionnel s'utilise toujours avec une préposition : в, на, о (об devant une voyelle), при. Les prépositions с, к, от, для ne vont pas avec lui.",
};

// « À retenir » (affiché sous le récapitulatif).
export const takeaways = [
  "Chaque cas a ses propres questions et ses propres terminaisons.",
  "Les terminaisons changent selon le genre (masculin, féminin, neutre) et le nombre (singulier, pluriel).",
  "Les prépositions sont souvent des indices pour savoir quel cas utiliser.",
  "Pour un être animé, l'accusatif copie le génitif (masculin singulier et tous les pluriels).",
  "Maîtriser les cas est essentiel pour bien construire tes phrases en russe.",
];

// ---------------------------------------------------------------------------
// Informations de présentation de chaque cas.
//   shortRole      : le rôle en quelques mots (tableau récapitulatif)
//   role           : une phrase simple
//   questionsFr    : les questions en français
//   oftenWith      : prépositions et mots « souvent utilisés avec ce cas »
//   rows           : tableau principal. Une ligne = un genre (ou animé / inanimé)
//                    { g, sub?, word, number, animate?, ends, endsText, fr, prefix? }
//                      ends     : terminaisons possibles (pour les tests) ; "" = Ø
//                      endsText : texte affiché dans la colonne Terminaison
//   special        : « cas particuliers » { endsText, ends, when, examples }
//                    exemple = { word, number, animate?, stressed?, loc?, prefix?, fr }
//                           ou { text, fr } (exemple figé, non calculé)
// ---------------------------------------------------------------------------
export const caseInfo = {
  nom: {
    shortRole: "Sujet",
    role: "Désigne le sujet de la phrase : celui qui fait l'action ou dont on parle.",
    questionsFr: "qui ? quoi ?",
    oftenWith: { prepositions: [], words: [], note: "Aucune préposition ne s'utilise avec le nominatif." },
    rows: [
      { g: "M", word: "студент", number: "sg", endsText: "Ø (-й, -ь)", fr: "l'étudiant" },
      { g: "F", word: "девушка", number: "sg", endsText: "-а / -я", fr: "la fille" },
      { g: "N", word: "окно", number: "sg", endsText: "-о / -е", fr: "la fenêtre" },
      { g: "P", word: "студент", number: "pl", endsText: "-ы / -и (neutre : -а / -я)", fr: "les étudiants" },
    ],
    special: [
      { endsText: "-й, -ь", when: "Masculin à thème mou", examples: [{ text: "музей", fr: "le musée" }, { text: "учитель", fr: "le professeur" }] },
      { endsText: "-ь", when: "Féminin de la 3e déclinaison", examples: [{ text: "дверь", fr: "la porte" }, { text: "ночь", fr: "la nuit" }] },
      { endsText: "-ия, -ие", when: "-ия est féminin, -ие est neutre", examples: [{ text: "станция", fr: "la station" }, { text: "здание", fr: "le bâtiment" }] },
      { endsText: "-мя", when: "Dix neutres particuliers", examples: [{ text: "имя", fr: "le prénom" }, { text: "время", fr: "le temps" }] },
    ],
  },
  gen: {
    shortRole: "Possession, absence, quantité",
    role: "Exprime la possession, l'absence, la quantité, la partie de quelque chose.",
    questionsFr: "de qui ? de quoi ?",
    oftenWith: {
      prepositions: [
        { ru: "без", fr: "sans" }, { ru: "для", fr: "pour" }, { ru: "до", fr: "jusqu'à, avant" },
        { ru: "из", fr: "de, hors de" }, { ru: "от", fr: "de (provenance)" }, { ru: "у", fr: "chez" },
        { ru: "около", fr: "près de" }, { ru: "после", fr: "après" }, { ru: "кроме", fr: "sauf" },
        { ru: "с", fr: "depuis, de" },
      ],
      words: [{ ru: "нет", fr: "il n'y a pas" }, { ru: "много", fr: "beaucoup" }, { ru: "мало", fr: "peu" }],
    },
    rows: [
      { g: "M", word: "студент", number: "sg", ends: ["а", "я"], endsText: "-а / -я", fr: "de l'étudiant" },
      { g: "F", word: "девушка", number: "sg", ends: ["ы", "и"], endsText: "-ы / -и", fr: "de la fille" },
      { g: "N", word: "окно", number: "sg", ends: ["а", "я"], endsText: "-а / -я", fr: "de la fenêtre" },
      { g: "P", word: "студент", number: "pl", ends: ["ов", "ев", "ей", ""], endsText: "-ов / -ев / -ей / Ø", fr: "des étudiants" },
    ],
    special: [
      { endsText: "-я", ends: ["я"], when: "Masculin à thème mou (-ь, -й)", examples: [
        { word: "учитель", number: "sg", animate: true, fr: "du professeur" }, { word: "музей", number: "sg", fr: "du musée" }] },
      { endsText: "-и", ends: ["и"], when: "Féminin en -ь, -ия, -я", examples: [
        { word: "ночь", number: "sg", fr: "de la nuit" }, { word: "Россия", number: "sg", fr: "de la Russie" }] },
      { endsText: "-ей", ends: ["ей"], when: "Pluriel des mots en -ь et des mots en -ж, -ш, -ч, -щ", examples: [
        { word: "учитель", number: "pl", animate: true, fr: "des professeurs" }, { word: "ночь", number: "pl", fr: "des nuits" }] },
      { endsText: "-ев", ends: ["ев"], when: "Pluriel des mots en -й", examples: [{ word: "музей", number: "pl", fr: "des musées" }] },
      { endsText: "-ий", ends: ["ий"], when: "Pluriel des mots en -ие, -ия", examples: [
        { word: "здание", number: "pl", fr: "des bâtiments" }, { word: "станция", number: "pl", fr: "des stations" }] },
      { endsText: "Ø", ends: [""], when: "Pluriel des mots en -а, -о : on retire la terminaison, parfois avec une voyelle mobile", examples: [
        { word: "книга", number: "pl", fr: "des livres" }, { word: "окно", number: "pl", fr: "des fenêtres" }, { word: "девушка", number: "pl", animate: true, fr: "des filles" }] },
    ],
  },
  dat: {
    shortRole: "Destinataire",
    role: "Indique la personne à qui l'on donne, dit ou destine quelque chose.",
    questionsFr: "à qui ? à quoi ?",
    oftenWith: {
      prepositions: [{ ru: "к", fr: "vers, chez" }, { ru: "по", fr: "le long de, selon" }],
      words: [
        { ru: "давать", fr: "donner" }, { ru: "помогать", fr: "aider" }, { ru: "звонить", fr: "téléphoner" },
        { ru: "писать", fr: "écrire" }, { ru: "говорить", fr: "dire" }, { ru: "нравиться", fr: "plaire" },
      ],
    },
    rows: [
      { g: "M", word: "студент", number: "sg", ends: ["у", "ю"], endsText: "-у / -ю", fr: "à l'étudiant" },
      { g: "F", word: "девушка", number: "sg", ends: ["е", "и"], endsText: "-е (-и après -ь, -ия)", fr: "à la fille" },
      { g: "N", word: "окно", number: "sg", ends: ["у", "ю"], endsText: "-у / -ю", fr: "à la fenêtre" },
      { g: "P", word: "студент", number: "pl", ends: ["ам", "ям"], endsText: "-ам / -ям", fr: "aux étudiants" },
    ],
    special: [
      { endsText: "-и", ends: ["и"], when: "Féminin en -ь et en -ия", examples: [
        { word: "ночь", number: "sg", fr: "à la nuit" }, { word: "Россия", number: "sg", fr: "à la Russie" }] },
      { endsText: "-ю", ends: ["ю"], when: "Masculin et neutre à thème mou", examples: [
        { word: "учитель", number: "sg", animate: true, fr: "au professeur" }, { word: "море", number: "sg", fr: "à la mer" }] },
      { endsText: "-ию", ends: ["ию"], when: "Neutre en -ие", examples: [{ word: "здание", number: "sg", fr: "au bâtiment" }] },
    ],
  },
  acc: {
    shortRole: "Objet direct",
    role: "Indique l'objet direct : ce que l'on voit, ce que l'on prend, ce que l'on aime.",
    questionsFr: "qui ? quoi ?",
    oftenWith: {
      prepositions: [
        { ru: "в", fr: "dans, vers (mouvement)" }, { ru: "на", fr: "sur, vers (mouvement)" },
        { ru: "за", fr: "pour, derrière (mouvement)" }, { ru: "через", fr: "à travers, dans (délai)" },
        { ru: "про", fr: "à propos de" },
      ],
      words: [{ ru: "видеть", fr: "voir" }, { ru: "любить", fr: "aimer" }, { ru: "читать", fr: "lire" }, { ru: "знать", fr: "connaître" }],
    },
    rows: [
      { g: "M", sub: "inanimé", word: "стол", number: "sg", ends: [""], endsText: "Ø (comme le nominatif)", fr: "la table" },
      { g: "M", sub: "animé", word: "студент", number: "sg", animate: true, ends: ["а", "я"], endsText: "-а / -я (comme le génitif)", fr: "l'étudiant" },
      { g: "F", word: "девушка", number: "sg", animate: true, ends: ["у", "ю"], endsText: "-у / -ю", fr: "la fille" },
      { g: "N", word: "окно", number: "sg", ends: [""], endsText: "Ø (comme le nominatif)", fr: "la fenêtre" },
      { g: "P", sub: "inanimé", word: "стол", number: "pl", ends: ["ы", "и"], endsText: "-ы / -и (comme le nominatif)", fr: "les tables" },
      { g: "P", sub: "animé", word: "студент", number: "pl", animate: true, ends: ["ов", "ев", "ей", ""], endsText: "-ов / -ев / -ей / Ø (comme le génitif)", fr: "les étudiants" },
    ],
    special: [
      { endsText: "-ю", ends: ["ю"], when: "Féminin en -я et en -ия", examples: [
        { word: "неделя", number: "sg", fr: "la semaine" }, { word: "Россия", number: "sg", fr: "la Russie" }] },
      { endsText: "Ø", ends: [""], when: "Féminin en -ь : identique au nominatif", examples: [
        { word: "дверь", number: "sg", fr: "la porte" }, { word: "ночь", number: "sg", fr: "la nuit" }] },
      { endsText: "-ов / -ей / Ø", ends: ["ов", "ей", ""], when: "Pluriel animé : identique au génitif pluriel", examples: [
        { word: "девушка", number: "pl", animate: true, fr: "les filles" }, { word: "учитель", number: "pl", animate: true, fr: "les professeurs" }] },
    ],
  },
  ins: {
    shortRole: "Instrument, manière, compagnie",
    role: "Indique l'instrument, le moyen, la manière, la compagnie.",
    questionsFr: "par qui ? avec qui ? avec quoi ?",
    oftenWith: {
      prepositions: [
        { ru: "с", fr: "avec" }, { ru: "над", fr: "au-dessus de" }, { ru: "под", fr: "sous" },
        { ru: "перед", fr: "devant" }, { ru: "между", fr: "entre" }, { ru: "за", fr: "derrière" },
      ],
      words: [
        { ru: "работать", fr: "travailler (comme)" }, { ru: "стать", fr: "devenir" },
        { ru: "интересоваться", fr: "s'intéresser à" }, { ru: "гордиться", fr: "être fier de" },
      ],
    },
    rows: [
      { g: "M", word: "студент", number: "sg", prefix: "со ", ends: ["ом", "ем"], endsText: "-ом / -ем (-ём)", fr: "avec l'étudiant" },
      { g: "F", word: "девушка", number: "sg", prefix: "с ", ends: ["ой", "ей"], endsText: "-ой / -ей (-ёй)", fr: "avec la fille" },
      { g: "N", word: "окно", number: "sg", prefix: "перед ", ends: ["ом", "ем"], endsText: "-ом / -ем", fr: "devant la fenêtre" },
      { g: "P", word: "студент", number: "pl", prefix: "со ", ends: ["ами", "ями"], endsText: "-ами / -ями", fr: "avec les étudiants" },
    ],
    special: [
      { endsText: "-ью", ends: ["ью"], when: "Féminin en -ь", examples: [
        { word: "ночь", number: "sg", fr: "la nuit (adverbe)" }, { word: "дверь", number: "sg", prefix: "за ", fr: "derrière la porte" }] },
      { endsText: "-ией", ends: ["ией"], when: "Féminin en -ия", examples: [
        { word: "Россия", number: "sg", prefix: "с ", fr: "avec la Russie" }, { word: "станция", number: "sg", prefix: "перед ", fr: "devant la station" }] },
      { endsText: "-ём / -ёй", ends: ["ём", "ёй"], when: "Terminaison accentuée d'un mot mou", examples: [
        { word: "словарь", number: "sg", fr: "avec le dictionnaire" }, { word: "земля", number: "sg", stressed: true, fr: "avec la terre" }] },
      { endsText: "-ьми", ends: ["ьми"], when: "Quelques pluriels irréguliers", examples: [{ text: "детьми", fr: "avec les enfants" }, { text: "людьми", fr: "avec les gens" }] },
    ],
  },
  pre: {
    shortRole: "Lieu, temps, sujet de la conversation",
    role: "Indique le lieu, le temps, la position, et ce dont on parle.",
    questionsFr: "de qui ? de quoi ? où ?",
    oftenWith: {
      prepositions: [
        { ru: "в", fr: "dans" }, { ru: "на", fr: "sur, à" }, { ru: "о / об", fr: "au sujet de" }, { ru: "при", fr: "auprès de" },
      ],
      words: [],
    },
    rows: [
      { g: "M", word: "город", number: "sg", prefix: "в ", ends: ["е"], endsText: "-е", fr: "dans la ville" },
      { g: "F", word: "страна", number: "sg", prefix: "в ", ends: ["е"], endsText: "-е (-и après -ь, -ии après -ия)", fr: "dans le pays" },
      { g: "N", word: "море", number: "sg", prefix: "в ", ends: ["е"], endsText: "-е (-ии après -ие)", fr: "dans la mer" },
      { g: "P", word: "город", number: "pl", prefix: "в ", ends: ["ах", "ях"], endsText: "-ах / -ях", fr: "dans les villes" },
    ],
    special: [
      { endsText: "-ии", ends: ["ии"], when: "Mots en -ий, -ие, -ия", examples: [
        { word: "санаторий", number: "sg", prefix: "в ", fr: "dans le sanatorium" },
        { word: "здание", number: "sg", prefix: "в ", fr: "dans le bâtiment" },
        { word: "Россия", number: "sg", prefix: "в ", fr: "en Russie" }] },
      { endsText: "-и", ends: ["и"], when: "Féminin en -ь", examples: [
        { word: "тетрадь", number: "sg", prefix: "в ", fr: "dans le cahier" }, { word: "ночь", number: "sg", prefix: "о ", fr: "de la nuit" }] },
      { endsText: "-у / -ю", ends: ["у", "ю"], when: "Quelques masculins prennent -у après в ou на (locatif) : à connaître par cœur", examples: [
        { word: "лес", number: "sg", loc: true, prefix: "в ", fr: "dans la forêt" },
        { word: "мост", number: "sg", loc: true, prefix: "на ", fr: "sur le pont" },
        { word: "сад", number: "sg", loc: true, prefix: "в ", fr: "dans le jardin" }] },
    ],
  },
};

// ---------------------------------------------------------------------------
// Détail des 6 cas : usage, phrases d'exemple et exercices de la leçon interactive.
// Consommé par src/pages/Cases.jsx.
// ---------------------------------------------------------------------------
export const cases = [
  {
    key:"nom", label:"Nominatif", ru:"именительный", questions:"кто? что?",
    usage:[
      "C'est la forme de base d'un nom, celle que tu trouves dans le dictionnaire.",
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
      {type:"type", prompt:"___ работает дома.", base:"брат (le frère) · Nominatif, sujet", answer:["брат"]},
      {type:"mcq", prompt:"Кто читает книгу?", base:"Nominatif, sujet", options:["студент","студента","студенту"], answer:["студент"]},
      {type:"type", prompt:"___ учится в школе.", base:"сестра (la sœur) · Nominatif, sujet", answer:["сестра"]},
      {type:"mcq", prompt:"Что лежит на столе?", base:"Nominatif, sujet", options:["книга","книгу","книги"], answer:["книга"]},
      {type:"type", prompt:"___ открыто.", base:"окно (la fenêtre) · Nominatif, sujet", answer:["окно"]},
      {type:"mcq", prompt:"Что там?", base:"Nominatif, sujet", options:["письмо","письма","письму"], answer:["письмо"]},
      {type:"type", prompt:"___ приходят вечером.", base:"друзья (les amis) · Nominatif pluriel", answer:["друзья"]},
      {type:"mcq", prompt:"Кто здесь?", base:"Nominatif pluriel", options:["студенты","студентов","студентам"], answer:["студенты"]},
      {type:"type", prompt:"___ большой.", base:"город (la ville) · Nominatif, sujet", answer:["город"]},
      {type:"type", prompt:"___ едет быстро.", base:"машина (la voiture) · Nominatif, sujet", answer:["машина"]},
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
