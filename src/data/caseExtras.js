// ---------------------------------------------------------------------------
// Contenus ajoutés au module « Les cas » (le contenu d'origine de cases.js reste intact) :
//   1. extraExamples     : phrases d'exemple supplémentaires, avec du vocabulaire de l'app
//   2. recognitionItems  : phrases pour s'entraîner à RECONNAÎTRE un cas
//   3. prepositionTable  : « quelle préposition, quel cas ? »
//
// Garde-fou : chaque forme (mot souligné, mot d'exemple, phrase de préposition) est vérifiée
// par tests/case-extras.test.js, qui la recalcule avec le moteur de déclinaison.
// ---------------------------------------------------------------------------

// ---------------------------------------------------------------------------
// 1. Exemples supplémentaires, même format que cases[].examples :
//    [étiquette, phrase russe, phonétique (non affichée), traduction, mot mis en évidence, vérification]
//    `vérification` = { lemma, n: "sg" | "pl", animate? } : forme attendue du mot au cas concerné.
// ---------------------------------------------------------------------------
export const extraExamples = {
  nom: [
    ["M animé", "Мой брат работает в банке.", "", "Mon frère travaille dans une banque.", "брат", { lemma: "брат", n: "sg" }],
    ["F", "Моя мама любит читать.", "", "Ma maman aime lire.", "мама", { lemma: "мама", n: "sg" }],
    ["N", "Это окно открыто.", "", "Cette fenêtre est ouverte.", "окно", { lemma: "окно", n: "sg" }],
    ["P", "Сегодня студенты слушают учителя.", "", "Aujourd'hui, les étudiants écoutent le professeur.", "студенты", { lemma: "студент", n: "pl" }],
  ],
  gen: [
    ["M", "Это номер телефона.", "", "C'est le numéro de téléphone.", "телефона", { lemma: "телефон", n: "sg" }],
    ["F", "У него нет книги.", "", "Il n'a pas de livre.", "книги", { lemma: "книга", n: "sg" }],
    ["N", "Я пью чай без молока.", "", "Je bois du thé sans lait.", "молока", { lemma: "молоко", n: "sg" }],
    ["P", "В городе много автобусов.", "", "Il y a beaucoup d'autobus dans la ville.", "автобусов", { lemma: "автобус", n: "pl" }],
  ],
  dat: [
    ["M animé", "Я звоню врачу.", "", "J'appelle le médecin.", "врачу", { lemma: "врач", n: "sg" }],
    ["F", "Мама помогает сестре.", "", "Maman aide sa sœur.", "сестре", { lemma: "сестра", n: "sg" }],
    ["N", "Мы идём к морю.", "", "Nous allons vers la mer.", "морю", { lemma: "море", n: "sg" }],
    ["P", "Я пишу письма друзьям.", "", "J'écris des lettres à mes amis.", "друзьям", { lemma: "друг", n: "pl" }],
  ],
  acc: [
    ["M inanimé", "Я покупаю телефон.", "", "J'achète un téléphone.", "телефон", { lemma: "телефон", n: "sg" }],
    ["M animé", "Я вижу тигра.", "", "Je vois un tigre.", "тигра", { lemma: "тигр", n: "sg", animate: true }],
    ["F", "Мы смотрим оперу.", "", "Nous regardons un opéra.", "оперу", { lemma: "опера", n: "sg" }],
    ["N", "Я открываю окно.", "", "J'ouvre la fenêtre.", "окно", { lemma: "окно", n: "sg" }],
    ["P", "Мы любим твоих друзей.", "", "Nous aimons tes amis.", "друзей", { lemma: "друг", n: "pl", animate: true }],
  ],
  ins: [
    ["M", "Я пишу карандашом.", "", "J'écris au crayon.", "карандашом", { lemma: "карандаш", n: "sg" }],
    ["F", "Я иду в театр с сестрой.", "", "Je vais au théâtre avec ma sœur.", "сестрой", { lemma: "сестра", n: "sg" }],
    ["N", "Мы любуемся морем.", "", "Nous admirons la mer.", "морем", { lemma: "море", n: "sg" }],
    ["P", "Она гордится детьми.", "", "Elle est fière de ses enfants.", "детьми", { lemma: "ребёнок", n: "pl" }],
  ],
  pre: [
    ["M animé", "Мы говорим о брате.", "", "Nous parlons de notre frère.", "брате", { lemma: "брат", n: "sg" }],
    ["F", "Книга лежит на полке.", "", "Le livre est sur l'étagère.", "полке", { lemma: "полка", n: "sg" }],
    ["N", "Он думает о лете.", "", "Il pense à l'été.", "лете", { lemma: "лето", n: "sg" }],
    ["P", "Я читаю о городах.", "", "Je lis des choses sur les villes.", "городах", { lemma: "город", n: "pl" }],
  ],
};

// ---------------------------------------------------------------------------
// 2. Phrases de reconnaissance : un mot est souligné, il faut dire dans quel cas il est.
//    Le cas doit être déterminé SANS AMBIGUÏTÉ par le contexte (préposition, verbe, rôle).
//    `hint` explique l'indice qui permet de trancher.
//    Champs : case, lemma, n ("sg" | "pl"), animate?, loc?, before, word, after, fr, hint
// ---------------------------------------------------------------------------
export const recognitionItems = [
  // Nominatif : le sujet
  { case: "nom", lemma: "книга", n: "sg", before: "Эта ", word: "книга", after: " очень интересная.", fr: "Ce livre est très intéressant.", hint: "« Книга » est le sujet : c'est de lui qu'on parle. Le sujet est au nominatif." },
  { case: "nom", lemma: "брат", n: "sg", before: "Там живёт мой ", word: "брат", after: ".", fr: "Mon frère habite là-bas.", hint: "C'est le frère qui fait l'action d'habiter : c'est le sujet." },
  { case: "nom", lemma: "ребёнок", n: "pl", before: "Во дворе играют ", word: "дети", after: ".", fr: "Les enfants jouent dans la cour.", hint: "Ce sont les enfants qui jouent : sujet, même placé après le verbe." },
  { case: "nom", lemma: "дождь", n: "sg", before: "Вчера шёл ", word: "дождь", after: ".", fr: "Hier, il a plu.", hint: "« Дождь » est le sujet du verbe « шёл »." },
  { case: "nom", lemma: "письмо", n: "sg", before: "На столе лежит ", word: "письмо", after: ".", fr: "Il y a une lettre sur la table.", hint: "C'est la lettre qui est posée : elle est le sujet de « лежит »." },

  // Génitif : possession, absence (нет), quantité, provenance
  { case: "gen", lemma: "время", n: "sg", before: "У меня нет ", word: "времени", after: ".", fr: "Je n'ai pas le temps.", hint: "Après « нет » (il n'y a pas), on met le génitif." },
  { case: "gen", lemma: "брат", n: "sg", before: "Это дом моего ", word: "брата", after: ".", fr: "C'est la maison de mon frère.", hint: "La possession (de qui ?) se dit au génitif." },
  { case: "gen", lemma: "центр", n: "sg", before: "Мы живём недалеко от ", word: "центра", after: ".", fr: "Nous habitons près du centre.", hint: "La préposition « от » demande le génitif." },
  { case: "gen", lemma: "студент", n: "pl", before: "В классе много ", word: "студентов", after: ".", fr: "Il y a beaucoup d'étudiants dans la classe.", hint: "Après « много » (beaucoup), on met le génitif pluriel." },
  { case: "gen", lemma: "сахар", n: "sg", before: "Чай без ", word: "сахара", after: ", пожалуйста.", fr: "Un thé sans sucre, s'il vous plaît.", hint: "La préposition « без » (sans) demande le génitif." },
  { case: "gen", lemma: "Москва", n: "sg", before: "Он вернулся из ", word: "Москвы", after: ".", fr: "Il est revenu de Moscou.", hint: "La préposition « из » (de, hors de) demande le génitif." },

  // Datif : à qui ? (destinataire)
  { case: "dat", lemma: "друг", n: "sg", before: "Я звоню ", word: "другу", after: ".", fr: "J'appelle un ami.", hint: "« Звонить » (téléphoner à) se construit avec le datif : à qui ?" },
  { case: "dat", lemma: "врач", n: "sg", before: "Мы идём к ", word: "врачу", after: ".", fr: "Nous allons chez le médecin.", hint: "La préposition « к » (vers, chez) demande le datif." },
  { case: "dat", lemma: "мама", n: "sg", before: "Она помогает ", word: "маме", after: ".", fr: "Elle aide sa maman.", hint: "« Помогать » (aider) se construit avec le datif : on aide à qui ?" },
  { case: "dat", lemma: "студент", n: "pl", before: "Эта книга нравится ", word: "студентам", after: ".", fr: "Ce livre plaît aux étudiants.", hint: "« Нравиться » (plaire) se construit avec le datif : à qui ça plaît ?" },
  { case: "dat", lemma: "брат", n: "sg", before: "Я пишу письмо ", word: "брату", after: ".", fr: "J'écris une lettre à mon frère.", hint: "Le destinataire (à qui j'écris ?) se met au datif." },
  { case: "dat", lemma: "город", n: "sg", before: "Мы гуляем по ", word: "городу", after: ".", fr: "Nous nous promenons dans la ville.", hint: "La préposition « по » (le long de, à travers) demande le datif." },

  // Accusatif : objet direct, direction
  { case: "acc", lemma: "книга", n: "sg", before: "Я читаю ", word: "книгу", after: ".", fr: "Je lis un livre.", hint: "Objet direct de « читаю » : accusatif (-у pour un féminin en -а)." },
  { case: "acc", lemma: "брат", n: "sg", animate: true, before: "Он видит ", word: "брата", after: ".", fr: "Il voit son frère.", hint: "Objet direct, et un être animé : l'accusatif copie le génitif (брата)." },
  { case: "acc", lemma: "страна", n: "sg", before: "Мы любим эту ", word: "страну", after: ".", fr: "Nous aimons ce pays.", hint: "Objet direct d'un féminin en -а : accusatif en -у." },
  { case: "acc", lemma: "чай", n: "sg", before: "Я пью ", word: "чай", after: ".", fr: "Je bois du thé.", hint: "Objet direct : accusatif. Un masculin inanimé garde la forme du nominatif." },
  { case: "acc", lemma: "окно", n: "sg", before: "Я открываю ", word: "окно", after: ".", fr: "J'ouvre la fenêtre.", hint: "Objet direct. Un neutre garde la forme du nominatif à l'accusatif." },
  { case: "acc", lemma: "магазин", n: "sg", before: "Мы идём в ", word: "магазин", after: ".", fr: "Nous allons au magasin.", hint: "« В » + mouvement (on va quelque part) : accusatif. Pour dire où l'on est, ce serait le prépositionnel." },
  { case: "acc", lemma: "студент", n: "pl", animate: true, before: "Я знаю этих ", word: "студентов", after: ".", fr: "Je connais ces étudiants.", hint: "Objet direct, pluriel animé : l'accusatif copie le génitif pluriel (студентов)." },

  // Instrumental : avec quoi / avec qui, profession
  { case: "ins", lemma: "ручка", n: "sg", before: "Я пишу ", word: "ручкой", after: ".", fr: "J'écris avec un stylo.", hint: "L'instrument (avec quoi ?) se met à l'instrumental, sans préposition." },
  { case: "ins", lemma: "врач", n: "sg", before: "Он работает ", word: "врачом", after: ".", fr: "Il travaille comme médecin.", hint: "Avec « работать », la profession (comme quoi ?) se met à l'instrumental." },
  { case: "ins", lemma: "друг", n: "sg", before: "Мы идём в кино с ", word: "другом", after: ".", fr: "Nous allons au cinéma avec un ami.", hint: "La préposition « с » (avec) demande l'instrumental." },
  { case: "ins", lemma: "молоко", n: "sg", before: "Чай с ", word: "молоком", after: ".", fr: "Du thé au lait.", hint: "La préposition « с » (avec) demande l'instrumental." },
  { case: "ins", lemma: "музыка", n: "sg", before: "Она интересуется ", word: "музыкой", after: ".", fr: "Elle s'intéresse à la musique.", hint: "« Интересоваться » (s'intéresser à) se construit avec l'instrumental." },
  { case: "ins", lemma: "город", n: "sg", before: "Над ", word: "городом", after: " летит самолёт.", fr: "Un avion vole au-dessus de la ville.", hint: "La préposition « над » (au-dessus de) demande l'instrumental." },

  // Prépositionnel : lieu (où ?) et sujet de la conversation (о)
  { case: "pre", lemma: "Москва", n: "sg", before: "Мы живём в ", word: "Москве", after: ".", fr: "Nous habitons à Moscou.", hint: "« В » + lieu où l'on est (où ?) : prépositionnel." },
  { case: "pre", lemma: "брат", n: "sg", before: "Они говорят о ", word: "брате", after: ".", fr: "Ils parlent de leur frère.", hint: "La préposition « о » (au sujet de) demande toujours le prépositionnel." },
  { case: "pre", lemma: "стол", n: "sg", before: "Книга лежит на ", word: "столе", after: ".", fr: "Le livre est sur la table.", hint: "« На » + lieu où l'on est (où ?) : prépositionnel." },
  { case: "pre", lemma: "мама", n: "sg", before: "Я думаю о ", word: "маме", after: ".", fr: "Je pense à ma maman.", hint: "La préposition « о » (au sujet de) demande toujours le prépositionnel." },
  { case: "pre", lemma: "театр", n: "sg", before: "Мы были в ", word: "театре", after: ".", fr: "Nous étions au théâtre.", hint: "« В » + lieu où l'on est : prépositionnel." },
  { case: "pre", lemma: "лес", n: "sg", loc: true, before: "Мы гуляем в ", word: "лесу", after: ".", fr: "Nous nous promenons dans la forêt.", hint: "Après « в » ou « на », quelques masculins prennent -у : в лесу. C'est un prépositionnel (locatif)." },
];

// ---------------------------------------------------------------------------
// 3. Prépositions et cas. Une entrée par préposition ; une préposition peut demander
//    plusieurs cas selon le sens (mouvement ou lieu). `ex` : exemple calculé par le moteur ;
//    `expect` : la phrase attendue, écrite à la main (vérifiée par les tests).
// ---------------------------------------------------------------------------
export const prepositionTable = [
  { ru: "без", uses: [{ case: "gen", meaning: "sans", ex: { word: "сахар", prefix: "без ", fr: "sans sucre", expect: "без сахара" } }] },
  { ru: "в", uses: [
    { case: "acc", meaning: "direction : où va-t-on ?", ex: { word: "школа", prefix: "в ", fr: "à l'école (on y va)", expect: "в школу" } },
    { case: "pre", meaning: "lieu : où est-on ?", ex: { word: "школа", prefix: "в ", fr: "à l'école (on y est)", expect: "в школе" } },
  ] },
  { ru: "для", uses: [{ case: "gen", meaning: "pour", ex: { word: "мама", prefix: "для ", fr: "pour maman", expect: "для мамы" } }] },
  { ru: "до", uses: [{ case: "gen", meaning: "jusqu'à, avant", ex: { word: "школа", prefix: "до ", fr: "avant l'école", expect: "до школы" } }] },
  { ru: "за", uses: [
    { case: "acc", meaning: "pour, au profit de", ex: { word: "мама", prefix: "за ", fr: "pour maman", expect: "за маму" } },
    { case: "ins", meaning: "derrière (position)", ex: { word: "дом", prefix: "за ", fr: "derrière la maison", expect: "за домом" } },
  ] },
  { ru: "из", uses: [{ case: "gen", meaning: "de, hors de (provenance)", ex: { word: "школа", prefix: "из ", fr: "de l'école", expect: "из школы" } }] },
  { ru: "к", uses: [{ case: "dat", meaning: "vers, chez", ex: { word: "врач", prefix: "к ", fr: "chez le médecin", expect: "к врачу" } }] },
  { ru: "кроме", uses: [{ case: "gen", meaning: "sauf", ex: { word: "брат", prefix: "кроме ", fr: "sauf le frère", expect: "кроме брата" } }] },
  { ru: "между", uses: [{ case: "ins", meaning: "entre", ex: { word: "дом", number: "pl", prefix: "между ", fr: "entre les maisons", expect: "между домами" } }] },
  { ru: "на", uses: [
    { case: "acc", meaning: "direction : où va-t-on ?", ex: { word: "работа", prefix: "на ", fr: "au travail (on y va)", expect: "на работу" } },
    { case: "pre", meaning: "lieu : où est-on ?", ex: { word: "работа", prefix: "на ", fr: "au travail (on y est)", expect: "на работе" } },
  ] },
  { ru: "над", uses: [{ case: "ins", meaning: "au-dessus de", ex: { word: "город", prefix: "над ", fr: "au-dessus de la ville", expect: "над городом" } }] },
  { ru: "о / об", uses: [{ case: "pre", meaning: "au sujet de (об devant une voyelle)", ex: { word: "мама", prefix: "о ", fr: "de maman", expect: "о маме" } }] },
  { ru: "около", uses: [{ case: "gen", meaning: "près de", ex: { word: "дом", prefix: "около ", fr: "près de la maison", expect: "около дома" } }] },
  { ru: "от", uses: [{ case: "gen", meaning: "de (provenance), de la part de", ex: { word: "друг", prefix: "от ", fr: "de la part d'un ami", expect: "от друга" } }] },
  { ru: "перед", uses: [{ case: "ins", meaning: "devant, avant", ex: { word: "дом", prefix: "перед ", fr: "devant la maison", expect: "перед домом" } }] },
  { ru: "по", uses: [{ case: "dat", meaning: "le long de, à travers", ex: { word: "город", prefix: "по ", fr: "dans la ville", expect: "по городу" } }] },
  { ru: "под", uses: [
    { case: "acc", meaning: "sous, avec mouvement", ex: { word: "машина", prefix: "под ", fr: "sous la voiture (on y va)", expect: "под машину" } },
    { case: "ins", meaning: "sous (position)", ex: { word: "машина", prefix: "под ", fr: "sous la voiture (on y est)", expect: "под машиной" } },
  ] },
  { ru: "после", uses: [{ case: "gen", meaning: "après", ex: { word: "школа", prefix: "после ", fr: "après l'école", expect: "после школы" } }] },
  { ru: "при", uses: [{ case: "pre", meaning: "auprès de, rattaché à", ex: { word: "университет", prefix: "при ", fr: "auprès de l'université", expect: "при университете" } }] },
  { ru: "про", uses: [{ case: "acc", meaning: "à propos de", ex: { word: "мама", prefix: "про ", fr: "à propos de maman", expect: "про маму" } }] },
  { ru: "с", uses: [
    { case: "gen", meaning: "depuis, de (en venant de)", ex: { word: "работа", prefix: "с ", fr: "du travail", expect: "с работы" } },
    { case: "ins", meaning: "avec", ex: { word: "мама", prefix: "с ", fr: "avec maman", expect: "с мамой" } },
  ] },
  { ru: "у", uses: [{ case: "gen", meaning: "chez, près de", ex: { word: "брат", prefix: "у ", fr: "chez le frère", expect: "у брата" } }] },
  { ru: "через", uses: [{ case: "acc", meaning: "à travers, dans (un délai)", ex: { word: "неделя", prefix: "через ", fr: "dans une semaine", expect: "через неделю" } }] },
];
