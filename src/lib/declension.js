// ---------------------------------------------------------------------------
// Moteur de déclinaison des noms russes.
//
// Entrée : un nom au nominatif singulier (ex. "книга").
// Sortie : les 6 cas au singulier et au pluriel, avec pour chaque forme la
// partie qui change (pour la surligner) et des avertissements quand le moteur
// n'est pas certain.
//
// Principe : trois niveaux, du plus sûr au moins sûr.
//   1. IRREGULAR : mots irréguliers fréquents, formes écrites à la main.
//   2. Règles par type de déclinaison (masculin dur, féminin en -а, etc.),
//      avec les règles d'orthographe (ы -> и, ем/ом, ев/ов...).
//   3. Avertissements explicites pour ce qu'aucune règle ne peut deviner
//      (accent tonique, voyelle mobile, pluriel irrégulier).
//
// Notion : la déclinaison russe dépend de la FIN du mot, mais aussi de
// l'accent tonique et du lexique. Un moteur à règles est exact pour les mots
// réguliers et doit rester honnête pour les autres.
// ---------------------------------------------------------------------------

export const CASES = ["nom", "gen", "dat", "acc", "ins", "pre"];

const VOWELS = "аеёиоуыэюя";
const HUSHERS = "жшчщ";
const VELARS = "гкх";

const isVowel = (c) => !!c && VOWELS.includes(c);
const lastChar = (s) => s.slice(-1);

// Une forme = { stem, end, text } : `end` est la partie à surligner.
const form = (stem, end = "") => ({ stem, end, text: stem + end });

// --- Données lexicales -------------------------------------------------------

// Masculins dont le pluriel nominatif est en -а/-я (дом -> дома).
const PLURAL_A = new Set([
  "адрес", "берег", "бок", "вечер", "глаз", "город", "дом", "лес", "номер",
  "остров", "паспорт", "поезд", "профессор", "доктор", "директор", "учитель",
  "повар", "шофёр", "сторож", "век", "счёт", "мастер",
]);

// Masculins qui ont un second prépositionnel en -у/-ю après в/на (в лесу).
const LOCATIVE = new Set([
  "лес", "сад", "мост", "шкаф", "пол", "берег", "аэропорт", "год", "порт",
  "снег", "нос", "бок", "ряд", "пруд", "мех", "мох", "круг",
]);

// Mots en -ок/-ек/-ец/-ёк/-ень qui NE perdent PAS leur voyelle.
const NO_FLEETING = new Set([
  "урок", "срок", "порок", "поток", "игрок", "знаток", "восток", "исток",
  "рок", "ток", "олень", "тюлень", "бок",
]);

// Mots dont la terminaison est accentuée par défaut (врач -> врачом, pas врачем).
const STRESSED_END = new Set([
  "врач", "нож", "карандаш", "ключ", "плащ", "мяч", "этаж", "душ", "конец",
  "словарь", "рубль", "календарь", "душа", "свеча",
]);

// Noms masculins ou communs qui se déclinent comme des féminins en -а/-я.
const MASC_A_DECL = new Set(["папа", "дядя", "дедушка", "мужчина", "юноша", "слуга", "судья"]);

// Noms invariables (ils ne changent jamais).
const INDECLINABLE = new Set([
  "кофе", "кафе", "шоссе", "пюре", "радио", "метро", "кино", "пальто", "фото",
  "видео", "меню", "интервью", "бюро", "пианино", "такси", "жюри", "табу",
  "тире", "эскимо",
]);

// Les dix neutres en -мя (déclinaison particulière).
const MYA_WORDS = new Set(["время", "имя", "племя", "бремя", "знамя", "семя", "стремя", "вымя", "пламя", "темя"]);

// Pluriels fréquents qu'on risque de saisir à la place du singulier.
const KNOWN_PLURALS = {
  люди: "человек", дети: "ребёнок", друзья: "друг", братья: "брат", сыновья: "сын",
  мужья: "муж", сёстры: "сестра", родители: "родитель",
};
const PLURALIA_TANTUM = new Set(["деньги", "часы", "очки", "ворота", "брюки", "сутки", "каникулы"]);

// Mots irréguliers : seules les formes à corriger sont listées. Les autres
// formes sont générées par les règles du `type` indiqué.
// `loc` : second prépositionnel en -у. `animate` : accusatif = génitif.
const IRREGULAR = {
  человек: {
    type: "M_HARD", animate: true,
    pl: { nom: "люди", gen: "людей", dat: "людям", ins: "людьми", pre: "людях" },
    note: "Pluriel irrégulier : человек -> люди (on dit aussi « 5 человек » après un nombre).",
  },
  ребёнок: {
    type: "M_HARD", animate: true,
    sg: { gen: "ребёнка", dat: "ребёнку", ins: "ребёнком", pre: "ребёнке" },
    pl: { nom: "дети", gen: "детей", dat: "детям", ins: "детьми", pre: "детях" },
    note: "Pluriel irrégulier : ребёнок -> дети.",
  },
  друг: {
    type: "M_HARD", animate: true,
    pl: { nom: "друзья", gen: "друзей", dat: "друзьям", ins: "друзьями", pre: "друзьях" },
    note: "Pluriel irrégulier : друг -> друзья.",
  },
  брат: {
    type: "M_HARD", animate: true,
    pl: { nom: "братья", gen: "братьев", dat: "братьям", ins: "братьями", pre: "братьях" },
    note: "Pluriel irrégulier : брат -> братья.",
  },
  сын: {
    type: "M_HARD", animate: true,
    pl: { nom: "сыновья", gen: "сыновей", dat: "сыновьям", ins: "сыновьями", pre: "сыновьях" },
    note: "Pluriel irrégulier : сын -> сыновья.",
  },
  муж: {
    type: "M_HARD", animate: true,
    pl: { nom: "мужья", gen: "мужей", dat: "мужьям", ins: "мужьями", pre: "мужьях" },
    note: "Pluriel irrégulier : муж -> мужья.",
  },
  отец: {
    type: "M_HARD", animate: true,
    sg: { gen: "отца", dat: "отцу", ins: "отцом", pre: "отце" },
    pl: { nom: "отцы", gen: "отцов", dat: "отцам", ins: "отцами", pre: "отцах" },
    note: "Voyelle mobile : отец -> отца (le -е- disparaît).",
  },
  день: {
    type: "M_SOFT",
    sg: { gen: "дня", dat: "дню", ins: "днём", pre: "дне" },
    pl: { nom: "дни", gen: "дней", dat: "дням", ins: "днями", pre: "днях" },
    note: "Voyelle mobile : день -> дня (le -е- disparaît).",
  },
  палец: {
    type: "M_HARD", animate: false,
    sg: { gen: "пальца", dat: "пальцу", ins: "пальцем", pre: "пальце" },
    pl: { nom: "пальцы", gen: "пальцев", dat: "пальцам", ins: "пальцами", pre: "пальцах" },
    note: "Voyelle mobile : палец -> пальца (le -е- disparaît et -л- devient -ль-).",
  },
  угол: {
    type: "M_HARD", loc: "углу",
    sg: { gen: "угла", dat: "углу", ins: "углом", pre: "угле" },
    pl: { nom: "углы", gen: "углов", dat: "углам", ins: "углами", pre: "углах" },
    note: "Voyelle mobile : угол -> угла (le -о- disparaît).",
  },
  рот: {
    type: "M_HARD", loc: "рту",
    sg: { gen: "рта", dat: "рту", ins: "ртом", pre: "рте" },
    pl: { nom: "рты", gen: "ртов", dat: "ртам", ins: "ртами", pre: "ртах" },
    note: "Voyelle mobile : рот -> рта (le -о- disparaît).",
  },
  глаз: {
    type: "M_HARD",
    pl: { nom: "глаза", gen: "глаз", dat: "глазам", ins: "глазами", pre: "глазах" },
    note: "Génitif pluriel sans terminaison : глаз.",
  },
  мать: {
    type: "F_SOFT", animate: true,
    sg: { gen: "матери", dat: "матери", ins: "матерью", pre: "матери" },
    pl: { nom: "матери", gen: "матерей", dat: "матерям", ins: "матерями", pre: "матерях" },
    note: "Le radical s'allonge : мать -> матер-.",
  },
  дочь: {
    type: "F_SOFT", animate: true,
    sg: { gen: "дочери", dat: "дочери", ins: "дочерью", pre: "дочери" },
    pl: { nom: "дочери", gen: "дочерей", dat: "дочерям", ins: "дочерьми", pre: "дочерях" },
    note: "Le radical s'allonge : дочь -> дочер-.",
  },
  любовь: {
    type: "F_SOFT",
    sg: { gen: "любви", dat: "любви", ins: "любовью", pre: "любви" },
    pl: null,
    note: "Voyelle mobile : любовь -> любви. Ce mot s'emploie très rarement au pluriel.",
  },
  церковь: {
    type: "F_SOFT",
    sg: { gen: "церкви", dat: "церкви", ins: "церковью", pre: "церкви" },
    pl: { nom: "церкви", gen: "церквей", dat: "церквям", ins: "церквями", pre: "церквях" },
    note: "Voyelle mobile : церковь -> церкви (le -о- disparaît).",
  },
  сестра: {
    type: "F_A", animate: true,
    pl: { nom: "сёстры", gen: "сестёр", dat: "сёстрам", ins: "сёстрами", pre: "сёстрах" },
    note: "Pluriel irrégulier : сестра -> сёстры (l'accent change, -е- devient -ё-).",
  },
  дядя: {
    type: "F_YA", animate: true,
    pl: { gen: "дядей" },
    note: "Masculin qui se décline comme un féminin en -я. Génitif pluriel : дядей.",
  },
  сердце: {
    type: "N_E",
    pl: { gen: "сердец" },
    note: "Génitif pluriel irrégulier : сердец.",
  },
  яблоко: {
    type: "N_O",
    pl: { nom: "яблоки", gen: "яблок", dat: "яблокам", ins: "яблоками", pre: "яблоках" },
    note: "Pluriel irrégulier : яблоко -> яблоки.",
  },
  дерево: {
    type: "N_O",
    pl: { nom: "деревья", gen: "деревьев", dat: "деревьям", ins: "деревьями", pre: "деревьях" },
    note: "Pluriel irrégulier : дерево -> деревья.",
  },
  облако: {
    type: "N_O",
    pl: { gen: "облаков" },
    note: "Génitif pluriel irrégulier : облаков.",
  },
  число: {
    type: "N_O",
    pl: { gen: "чисел" },
    note: "Génitif pluriel avec voyelle mobile : чисел.",
  },
  кресло: {
    type: "N_O",
    pl: { gen: "кресел" },
    note: "Génitif pluriel avec voyelle mobile : кресел.",
  },
  стекло: {
    type: "N_O",
    pl: { nom: "стёкла", gen: "стёкол", dat: "стёклам", ins: "стёклами", pre: "стёклах" },
    note: "Pluriel avec -ё- : стёкла.",
  },
  озеро: {
    type: "N_O",
    pl: { nom: "озёра", gen: "озёр", dat: "озёрам", ins: "озёрами", pre: "озёрах" },
    note: "Pluriel avec -ё- : озёра.",
  },
};

// --- Aides de construction ---------------------------------------------------

// -ы ou -и ? Après г, к, х, ж, ш, щ, ч on n'écrit jamais -ы.
const yi = (stem) => ((HUSHERS + VELARS).includes(lastChar(stem)) ? "и" : "ы");

// Génitif pluriel « zéro » (книга -> книг) avec voyelle mobile quand elle est prévisible.
function zeroGenPl(stem) {
  const a = stem.slice(-2, -1);
  const b = lastChar(stem);
  if (a === "ь" && !isVowel(b)) return { text: stem.slice(0, -2) + "е" + b, flagged: false }; // письмо -> писем
  if (a === "й" && b === "к") return { text: stem.slice(0, -2) + "ек", flagged: false }; // копейка -> копеек
  const cluster = a && !isVowel(a) && a !== "ь" && !isVowel(b) && b !== "ь" && b !== "й";
  if (!cluster) return { text: stem, flagged: false };
  if (b === "к") return { text: stem.slice(0, -1) + (HUSHERS.includes(a) ? "е" : "о") + b, flagged: false };
  if (b === "н" && a === "к") return { text: stem.slice(0, -1) + "о" + b, flagged: false }; // окно -> окон
  return { text: stem, flagged: true };
}

// Libellés lisibles des types, affichés dans l'outil.
const TYPE_LABELS = {
  M_HARD: "Masculin, thème dur (finit par une consonne)",
  M_J: "Masculin, thème mou (finit par -й)",
  M_IY: "Masculin en -ий",
  M_SOFT: "Masculin, thème mou (finit par -ь)",
  F_A: "Féminin en -а (déclinaison dure)",
  F_YA: "Féminin en -я (déclinaison molle)",
  F_YA2: "Féminin en -ья",
  F_IYA: "Féminin en -ия",
  F_SOFT: "Féminin en -ь (3e déclinaison)",
  N_O: "Neutre en -о",
  N_E: "Neutre en -е",
  N_IE: "Neutre en -ие",
  N_MYA: "Neutre en -мя (имя, время...)",
};
const TYPE_GENDER = {
  M_HARD: "M", M_J: "M", M_IY: "M", M_SOFT: "M",
  F_A: "F", F_YA: "F", F_YA2: "F", F_IYA: "F", F_SOFT: "F",
  N_O: "N", N_E: "N", N_IE: "N", N_MYA: "N",
};

// --- Constructeurs de déclinaison par type ----------------------------------
// Chaque constructeur renvoie { sg, pl, rules, warnings, loc }.
// `ctx` : { word, stressed, animate }. L'accusatif est calculé plus tard.

function buildMHard(stem, ctx, oblStem = stem) {
  const s = oblStem;
  const husher = HUSHERS.includes(lastChar(s));
  const ts = lastChar(s) === "ц";
  const rules = [];
  let insEnd = "ом";
  let genPl = "ов";
  if (husher || ts) {
    insEnd = ctx.stressed ? "ом" : "ем";
    rules.push(ctx.stressed
      ? "Après ж, ш, ч, щ, ц, la terminaison accentuée s'écrit -ом (и -ов)."
      : "Après ж, ш, ч, щ, ц, la terminaison non accentuée s'écrit -ем (и -ев).");
  }
  if (husher) genPl = "ей";
  else if (ts) genPl = ctx.stressed ? "ов" : "ев";
  const plNom = PLURAL_A.has(ctx.word) ? form(s, "а") : form(s, yi(s));
  if (!PLURAL_A.has(ctx.word) && yi(s) === "и") rules.push("Après г, к, х, ж, ш, ч, щ, on écrit -и et jamais -ы.");
  return {
    sg: {
      nom: form(ctx.word), gen: form(s, "а"), dat: form(s, "у"), ins: form(s, insEnd), pre: form(s, "е"),
    },
    pl: { nom: plNom, gen: form(s, genPl), dat: form(s, "ам"), ins: form(s, "ами"), pre: form(s, "ах") },
    loc: LOCATIVE.has(ctx.word) ? form(s, "у") : null,
    rules, warnings: [],
  };
}

function buildMJ(stem, ctx, { iy = false } = {}) {
  return {
    sg: {
      nom: form(ctx.word), gen: form(stem, "я"), dat: form(stem, "ю"),
      ins: form(stem, "ем"), pre: form(stem, iy ? "и" : "е"),
    },
    pl: { nom: form(stem, "и"), gen: form(stem, "ев"), dat: form(stem, "ям"), ins: form(stem, "ями"), pre: form(stem, "ях") },
    loc: null, rules: [], warnings: [],
  };
}

function buildMSoft(stem, ctx) {
  const plNom = PLURAL_A.has(ctx.word) ? form(stem, "я") : form(stem, "и");
  return {
    sg: {
      nom: form(ctx.word), gen: form(stem, "я"), dat: form(stem, "ю"),
      ins: form(stem, ctx.stressed ? "ём" : "ем"), pre: form(stem, "е"),
    },
    pl: { nom: plNom, gen: form(stem, "ей"), dat: form(stem, "ям"), ins: form(stem, "ями"), pre: form(stem, "ях") },
    loc: null,
    rules: ctx.stressed ? ["Terminaison accentuée : -ём au lieu de -ем."] : [],
    warnings: [],
  };
}

function buildFA(stem, ctx) {
  const husher = HUSHERS.includes(lastChar(stem));
  const ts = lastChar(stem) === "ц";
  const rules = [];
  let insEnd = "ой";
  if (husher || ts) {
    insEnd = ctx.stressed ? "ой" : "ей";
    rules.push(ctx.stressed
      ? "Après ж, ш, ч, щ, ц, la terminaison accentuée s'écrit -ой."
      : "Après ж, ш, ч, щ, ц, la terminaison non accentuée s'écrit -ей.");
  }
  if (yi(stem) === "и") rules.push("Après г, к, х, ж, ш, ч, щ, on écrit -и et jamais -ы.");
  const genPl = zeroGenPl(stem);
  const warnings = genPl.flagged
    ? ["Génitif pluriel : une voyelle mobile peut apparaître (comme книга -> книг, mais девушка -> девушек). Vérifie dans un dictionnaire."]
    : [];
  return {
    sg: {
      nom: form(ctx.word), gen: form(stem, yi(stem)), dat: form(stem, "е"), acc: form(stem, "у"),
      ins: form(stem, insEnd), pre: form(stem, "е"),
    },
    pl: {
      nom: form(stem, yi(stem)), gen: form(genPl.text, ""), dat: form(stem, "ам"), ins: form(stem, "ами"), pre: form(stem, "ах"),
    },
    loc: null, rules, warnings,
  };
}

function buildFYa(stem, ctx) {
  const vowelBefore = isVowel(lastChar(stem));
  const genPl = vowelBefore ? form(stem, "й") : form(stem, "ь");
  const warnings = [];
  const a = stem.slice(-2, -1);
  if (!vowelBefore && a && !isVowel(a)) {
    warnings.push("Génitif pluriel : une voyelle mobile peut apparaître (песня -> песен, деревня -> деревень). Vérifie dans un dictionnaire.");
  }
  return {
    sg: {
      nom: form(ctx.word), gen: form(stem, "и"), dat: form(stem, "е"), acc: form(stem, "ю"),
      ins: form(stem, ctx.stressed ? "ёй" : "ей"), pre: form(stem, "е"),
    },
    pl: { nom: form(stem, "и"), gen: genPl, dat: form(stem, "ям"), ins: form(stem, "ями"), pre: form(stem, "ях") },
    loc: null,
    rules: ctx.stressed ? ["Terminaison accentuée : -ёй au lieu de -ей."] : [],
    warnings,
  };
}

function buildFYa2(stem, ctx) {
  // семья -> stem "семь"
  return {
    sg: {
      nom: form(ctx.word), gen: form(stem, "и"), dat: form(stem, "е"), acc: form(stem, "ю"),
      ins: form(stem, "ёй"), pre: form(stem, "е"),
    },
    pl: {
      nom: form(stem, "и"), gen: form(stem.slice(0, -1), "ей"), dat: form(stem, "ям"), ins: form(stem, "ями"), pre: form(stem, "ях"),
    },
    loc: null, rules: [], warnings: [],
  };
}

function buildFIya(stem, ctx) {
  // Россия -> stem "Росси"
  return {
    sg: {
      nom: form(ctx.word), gen: form(stem, "и"), dat: form(stem, "и"), acc: form(stem, "ю"),
      ins: form(stem, "ей"), pre: form(stem, "и"),
    },
    pl: { nom: form(stem, "и"), gen: form(stem, "й"), dat: form(stem, "ям"), ins: form(stem, "ями"), pre: form(stem, "ях") },
    loc: null, rules: [], warnings: [],
  };
}

function buildFSoft(stem, ctx) {
  const husher = HUSHERS.includes(lastChar(stem));
  const rules = [];
  if (husher) rules.push("Après ж, ш, ч, щ, le pluriel prend -ам, -ами, -ах (jamais -ям, -ями, -ях).");
  return {
    sg: {
      nom: form(ctx.word), gen: form(stem, "и"), dat: form(stem, "и"), ins: form(stem, "ью"), pre: form(stem, "и"),
    },
    pl: {
      nom: form(stem, "и"), gen: form(stem, "ей"),
      dat: form(stem, husher ? "ам" : "ям"), ins: form(stem, husher ? "ами" : "ями"), pre: form(stem, husher ? "ах" : "ях"),
    },
    loc: null, rules, warnings: [],
  };
}

function buildNO(stem, ctx) {
  const genPl = zeroGenPl(stem);
  const warnings = genPl.flagged
    ? ["Génitif pluriel : une voyelle mobile peut apparaître (окно -> окон, письмо -> писем, кресло -> кресел). Vérifie dans un dictionnaire."]
    : [];
  return {
    sg: { nom: form(ctx.word), gen: form(stem, "а"), dat: form(stem, "у"), ins: form(stem, "ом"), pre: form(stem, "е") },
    pl: { nom: form(stem, "а"), gen: form(genPl.text, ""), dat: form(stem, "ам"), ins: form(stem, "ами"), pre: form(stem, "ах") },
    loc: null, rules: [], warnings,
  };
}

function buildNE(stem, ctx) {
  const l = lastChar(stem);
  const warnings = [];
  const rules = [];
  // Après ц, щ, ж, ш, ч : -а/-у au lieu de -я/-ю.
  if ((HUSHERS + "ц").includes(l)) {
    rules.push("Après ц, ж, ш, ч, щ, on écrit -а et -у (jamais -я ni -ю).");
    let genPl;
    if (l === "ц") {
      genPl = form(stem, "");
      warnings.push("Génitif pluriel : le mot a probablement une voyelle mobile (сердце -> сердец). Vérifie dans un dictionnaire.");
    } else {
      genPl = form(stem, "");
    }
    return {
      sg: { nom: form(ctx.word), gen: form(stem, "а"), dat: form(stem, "у"), ins: form(stem, "ем"), pre: form(stem, "е") },
      pl: { nom: form(stem, "а"), gen: genPl, dat: form(stem, "ам"), ins: form(stem, "ами"), pre: form(stem, "ах") },
      loc: null, rules, warnings,
    };
  }
  // -ье (платье) : stem se termine par ь.
  const genPlEnd = l === "ь" ? "ев" : "ей";
  return {
    sg: { nom: form(ctx.word), gen: form(stem, "я"), dat: form(stem, "ю"), ins: form(stem, "ем"), pre: form(stem, "е") },
    pl: { nom: form(stem, "я"), gen: form(stem, genPlEnd), dat: form(stem, "ям"), ins: form(stem, "ями"), pre: form(stem, "ях") },
    loc: null, rules, warnings,
  };
}

function buildNIe(stem, ctx) {
  // здание -> stem "здани"
  return {
    sg: { nom: form(ctx.word), gen: form(stem, "я"), dat: form(stem, "ю"), ins: form(stem, "ем"), pre: form(stem, "и") },
    pl: { nom: form(stem, "я"), gen: form(stem, "й"), dat: form(stem, "ям"), ins: form(stem, "ями"), pre: form(stem, "ях") },
    loc: null, rules: [], warnings: [],
  };
}

function buildNMya(base, ctx) {
  // время -> base "вре" ; имя -> base "и"
  const regular = ctx.word === "время" || ctx.word === "имя";
  return {
    sg: {
      nom: form(ctx.word), gen: form(base, "мени"), dat: form(base, "мени"), ins: form(base, "менем"), pre: form(base, "мени"),
    },
    pl: {
      nom: form(base, "мена"), gen: form(base, "мён"), dat: form(base, "менам"), ins: form(base, "менами"), pre: form(base, "менах"),
    },
    loc: null,
    rules: ["Les noms en -мя s'allongent en -мен- : время -> времени, времена."],
    warnings: regular ? [] : ["Les noms en -мя ont des pluriels parfois irréguliers (семя -> семена, mais génitif семян). Vérifie dans un dictionnaire."],
  };
}

// --- Détection --------------------------------------------------------------

const ADJECTIVE_ENDINGS = ["ый", "ая", "яя", "ое", "ее", "ые", "ский", "цкий", "ний", "жий", "чий"];

// Noms en -ь connus comme masculins (le reste est supposé féminin ; l'utilisateur peut corriger).
const MASC_SOFT_WORDS = new Set([
  "гость", "зверь", "дождь", "рубль", "портфель", "словарь", "календарь", "январь",
  "корень", "камень", "ремень", "огонь", "конь", "олень", "тюлень", "кашель", "уголь", "король",
]);

// « Россия » doit rester « России », « Россию »... : on conserve la majuscule initiale
// (mais « КНИГА » tout en capitales est traité comme un mot ordinaire).
function hasInitialCapital(raw) {
  const t = (raw || "").normalize("NFC").replace(/\u0301/g, "").trim();
  return /^[А-ЯЁ][а-яё]*$/.test(t);
}

function capitalizeForm(f) {
  if (!f) return f;
  if (f.stem) return { ...f, stem: f.stem[0].toUpperCase() + f.stem.slice(1), text: f.text[0].toUpperCase() + f.text.slice(1) };
  return { ...f, end: f.end[0].toUpperCase() + f.end.slice(1), text: f.text[0].toUpperCase() + f.text.slice(1) };
}

function cleanInput(raw) {
  return (raw || "").normalize("NFC").replace(/\u0301/g, "").trim().toLowerCase();
}

// Valeur par défaut de la voyelle mobile selon la fin du mot masculin.
function fleetingGuess(word) {
  if (NO_FLEETING.has(word)) return false;
  return /(ок|ек|ец|ёк|ень)$/.test(word);
}

function guessSoftSignGender(word) {
  if (/(ость|есть|знь|жь|чь|шь|щь)$/.test(word)) return "F";
  if (MASC_SOFT_WORDS.has(word) || /(тель|арь|ярь)$/.test(word)) return "M";
  return "F";
}

/**
 * Premier examen d'un mot saisi : le mot est-il pris en charge, de quel type,
 * et quelles sont les valeurs par défaut des réglages ?
 */
export function analyze(raw) {
  const word = cleanInput(raw);
  if (!word) return { ok: false, reason: "empty", message: "Écris un nom russe au nominatif singulier, par exemple книга." };
  if (!/^[а-яё]+$/.test(word)) {
    return { ok: false, reason: "not-cyrillic", message: "Écris le mot en lettres cyrilliques, sans espace ni chiffre." };
  }
  if (word.length < 2) return { ok: false, reason: "too-short", message: "Ce mot est trop court pour être analysé." };

  if (INDECLINABLE.has(word)) {
    return { ok: false, reason: "invariable", word, message: `« ${word} » est invariable : il garde la même forme à tous les cas et aux deux nombres.` };
  }
  if (KNOWN_PLURALS[word]) {
    return { ok: false, reason: "plural", word, message: `« ${word} » est un pluriel. Entre plutôt le singulier : ${KNOWN_PLURALS[word]}.` };
  }
  if (PLURALIA_TANTUM.has(word)) {
    return { ok: false, reason: "plural", word, message: `« ${word} » s'emploie surtout au pluriel : il n'a pas de singulier courant, donc l'outil ne peut pas le présenter.` };
  }
  const irregular = IRREGULAR[word] || null;
  if (!irregular && ADJECTIVE_ENDINGS.some((e) => word.endsWith(e))) {
    return { ok: false, reason: "adjective", word, message: "Ce mot ressemble à un adjectif (comme красный ou новая). Cet outil décline les noms : entre un nom au nominatif singulier." };
  }

  let type = irregular ? irregular.type : null;
  let softSign = false; // mot en -ь : masculin ou féminin ?
  if (!type) {
    if (MYA_WORDS.has(word)) type = "N_MYA";
    else if (word.endsWith("ия")) type = "F_IYA";
    else if (word.endsWith("ие")) type = "N_IE";
    else if (word.endsWith("ья")) type = "F_YA2";
    else if (word.endsWith("ье")) type = "N_E";
    else if (word.endsWith("ий")) type = "M_IY";
    else if (word.endsWith("я")) type = "F_YA";
    else if (word.endsWith("а")) type = "F_A";
    else if (word.endsWith("о")) type = "N_O";
    else if (word.endsWith("е")) type = "N_E";
    else if (word.endsWith("й")) type = "M_J";
    else if (word.endsWith("ь")) softSign = true;
    else if (/[бвгджзклмнпрстфхцчшщ]$/.test(word)) type = "M_HARD";
    else {
      return {
        ok: false, reason: "plural-or-unsupported", word,
        message: "Entre un nom au nominatif singulier (par exemple друг, pas друзья). Les mots en -ы, -и, -у, -ю, -э ne sont pas pris en charge.",
      };
    }
  }

  const defaults = {
    animate: !!(irregular && irregular.animate) || MASC_A_DECL.has(word),
    stressed: STRESSED_END.has(word),
    fleeting: fleetingGuess(word),
    gender: softSign ? guessSoftSignGender(word) : null,
  };
  return { ok: true, word, type, softSign, defaults, irregular };
}

// --- Aides de calcul --------------------------------------------------------

function stemFor(type, word) {
  if (type === "M_HARD") return word;
  if (type === "N_MYA") return word.slice(0, -2);
  return word.slice(0, -1);
}

// Radical sans la voyelle mobile : отец -> отц, кусок -> куск, корень -> корн.
function fleetingStem(word, type) {
  if (type === "M_HARD") {
    if (/ец$/.test(word)) return word.slice(0, -2) + (isVowel(word.slice(-3, -2)) ? "йц" : "ц");
    if (/(ок|ек)$/.test(word)) return word.slice(0, -2) + "к";
    if (/ёк$/.test(word)) return word.slice(0, -2) + "ьк";
  }
  if (type === "M_SOFT" && /ень$/.test(word)) return word.slice(0, -3) + "н";
  return null;
}

function commonPrefixLength(a, b) {
  let i = 0;
  while (i < a.length && i < b.length && a[i] === b[i]) i++;
  return i;
}

// Forme imposée à la main -> { stem, end, text } par comparaison avec le nominatif.
function formFromText(text, word) {
  const n = commonPrefixLength(text, word);
  return { stem: text.slice(0, n), end: text.slice(n), text };
}

const copy = (f) => (f ? { ...f } : f);

/**
 * Décline un nom au singulier et au pluriel.
 * `options` : { animate, gender (mots en -ь), stressed, fleeting }, tous facultatifs.
 *
 * Renvoie { ok:true, word, type, typeLabel, gender, sg, pl, loc, accSgFrom,
 * accPlFrom, rules, warnings, notes, controls, options, irregular }
 * ou { ok:false, reason, message } si le mot n'est pas pris en charge.
 */
export function decline(raw, options = {}) {
  const info = analyze(raw);
  if (!info.ok) return info;
  const { word, irregular } = info;

  const given = Object.fromEntries(Object.entries(options).filter(([, v]) => v !== undefined && v !== null));
  const opts = { ...info.defaults, ...given };
  const type = info.type || (opts.gender === "M" ? "M_SOFT" : "F_SOFT");
  const ctx = { word, stressed: !!opts.stressed, animate: !!opts.animate };

  const rules = [];
  const warnings = [];
  const notes = [];
  let fleetingRelevant = false;
  let stemForStress = null;

  let built;
  switch (type) {
    case "M_HARD": {
      fleetingRelevant = !irregular && /(ок|ек|ец|ёк)$/.test(word);
      const obl = fleetingRelevant && opts.fleeting ? fleetingStem(word, type) : word;
      built = buildMHard(word, ctx, obl);
      stemForStress = obl;
      if (obl !== word) notes.push(`Voyelle mobile : ${word} devient ${obl}${built.sg.gen.end} dès qu'on ajoute une terminaison.`);
      break;
    }
    case "M_J": built = buildMJ(stemFor(type, word), ctx); break;
    case "M_IY": built = buildMJ(stemFor(type, word), ctx, { iy: true }); break;
    case "M_SOFT": {
      fleetingRelevant = !irregular && /ень$/.test(word);
      const obl = fleetingRelevant && opts.fleeting ? fleetingStem(word, type) : stemFor(type, word);
      built = buildMSoft(obl, ctx);
      if (fleetingRelevant && opts.fleeting) notes.push(`Voyelle mobile : ${word} devient ${obl}${built.sg.gen.end} dès qu'on ajoute une terminaison.`);
      break;
    }
    case "F_A": built = buildFA(stemFor(type, word), ctx); stemForStress = stemFor(type, word); break;
    case "F_YA": built = buildFYa(stemFor(type, word), ctx); break;
    case "F_YA2": built = buildFYa2(stemFor(type, word), ctx); break;
    case "F_IYA": built = buildFIya(stemFor(type, word), ctx); break;
    case "F_SOFT": built = buildFSoft(stemFor(type, word), ctx); break;
    case "N_O": built = buildNO(stemFor(type, word), ctx); break;
    case "N_E": built = buildNE(stemFor(type, word), ctx); break;
    case "N_IE": built = buildNIe(stemFor(type, word), ctx); break;
    default: built = buildNMya(stemFor(type, word), ctx); break;
  }

  const sg = { ...built.sg };
  const pl = { ...built.pl };
  let loc = built.loc;
  rules.push(...built.rules);
  warnings.push(...built.warnings);

  // Formes irrégulières écrites à la main : elles remplacent les formes générées.
  let noPlural = false;
  if (irregular) {
    if (irregular.sg) Object.entries(irregular.sg).forEach(([k, v]) => { sg[k] = formFromText(v, word); });
    if (irregular.pl === null) {
      noPlural = true;
      warnings.length = 0;
    } else if (irregular.pl) {
      Object.entries(irregular.pl).forEach(([k, v]) => { pl[k] = formFromText(v, word); });
      warnings.length = 0; // le lexique a corrigé le point que le générateur jugeait incertain
    }
    if (irregular.loc) loc = formFromText(irregular.loc, word);
    if (irregular.note) notes.push(irregular.note);
  }

  // Accusatif : dépend du genre, de l'animé, et du nombre.
  let accSgFrom = null;
  if (type.startsWith("M_")) {
    accSgFrom = ctx.animate ? "gen" : "nom";
    sg.acc = copy(ctx.animate ? sg.gen : sg.nom);
  } else if (["N_O", "N_E", "N_IE", "N_MYA", "F_SOFT"].includes(type)) {
    accSgFrom = "nom";
    sg.acc = copy(sg.nom);
  } // F_A, F_YA, F_YA2, F_IYA : l'accusatif a sa propre terminaison (-у, -ю), déjà construite.
  const accPlFrom = ctx.animate ? "gen" : "nom";
  pl.acc = copy(ctx.animate ? pl.gen : pl.nom);

  if (noPlural) CASES.forEach((c) => { pl[c] = null; });

  if (hasInitialCapital(raw)) {
    CASES.forEach((c) => {
      if (sg[c]) sg[c] = capitalizeForm(sg[c]);
      if (pl[c]) pl[c] = capitalizeForm(pl[c]);
    });
    if (loc) loc = capitalizeForm(loc);
  }

  if (MASC_A_DECL.has(word)) notes.push("Ce nom désigne une personne de sexe masculin mais se décline comme un féminin en -а ou -я.");
  if (ctx.animate) rules.push("Être animé : l'accusatif pluriel copie le génitif pluriel (et, au masculin singulier, le génitif singulier).");
  if (!irregular) notes.push("Les formes sont générées par les règles. Pour un mot irrégulier, vérifie dans un dictionnaire.");

  // Quels réglages ont un effet sur CE mot ? (l'interface n'affiche que ceux-là)
  const stressRelevant = !irregular && (
    (type === "M_HARD" && /[жшчщц]$/.test(stemForStress || "")) ||
    type === "M_SOFT" ||
    (type === "F_A" && /[жшчщц]$/.test(stemForStress || "")) ||
    type === "F_YA"
  );
  const controls = { gender: info.softSign, fleeting: fleetingRelevant, stressed: stressRelevant };

  return {
    ok: true, word, type, gender: TYPE_GENDER[type], typeLabel: TYPE_LABELS[type],
    sg, pl, loc, accSgFrom, accPlFrom,
    rules: Array.from(new Set(rules)), warnings, notes,
    controls, options: opts, irregular: !!irregular,
  };
}

// Aplatit une déclinaison en { sg: {cas: texte}, pl: {cas: texte} } (pratique pour les tests).
export function toTexts(result) {
  const out = { sg: {}, pl: {} };
  CASES.forEach((c) => {
    out.sg[c] = result.sg[c] ? result.sg[c].text : null;
    out.pl[c] = result.pl[c] ? result.pl[c].text : null;
  });
  return out;
}
