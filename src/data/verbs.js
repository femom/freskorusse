// Couleur de badge selon le groupe de conjugaison (1, 2, ou "irr" pour irrégulier).
// Même famille de teinte (teal, cohérente avec l'accent du module "Conjugaison") pour les 3 :
// le groupe irrégulier est simplement plus foncé/saturé, pour signaler qu'il mérite une
// attention particulière, sans introduire une couleur totalement différente.
export const groupColor = {1:"#669f38", 2:"#bf614a", irr:"#196B5B"};
export const groupLabel = {1:"Groupe 1", 2:"Groupe 2", irr:"Irrégulier"};
// Pronoms utilisés pour l'affichage du présent/futur (personnel) et du passé (genre/nombre).
export const PRON = ["я","ты","он / она / оно","мы","вы","они"];
export const PAST_LBL = ["он","она","оно","они"];

// Longueur (en nombre de lettres) de la terminaison personnelle à chaque position
// du présent/futur, pour les verbes RÉGULIERS des groupes 1 et 2 : я, ты, он,
// мы, вы, они → 1, 3, 2, 2, 3, 2 lettres. Fait exprès pour ne dépendre ni du
// groupe (1/2) ni des mutations de consonnes (мочь: могу/можешь...), car une
// mutation ne change que le radical, jamais la longueur de la terminaison.
// Voir splitEnding() dans src/pages/Verbs.jsx pour l'utilisation.
export const REGULAR_ENDING_LENGTHS = [1,3,2,2,3,2];

// Quelques verbes ont une conjugaison trop irrégulière pour la règle générale
// ci-dessus (есть, съесть, дать) : on donne alors la longueur exacte de la
// terminaison pour CHACUNE des 6 formes, dans le même ordre que PRON.
export const IRREGULAR_ENDING_LENGTHS = {
  "Есть":   [1,2,2,2,3,2],  // е-м, е-шь, е-ст, ед-им, ед-ите, ед-ят
  "Съесть": [1,2,2,2,3,2],
  "Дать":   [1,2,2,2,3,2],  // да-м, да-шь, да-ст, дад-им, дад-ите, дад-ут
};

// Courtes explications (génériques, réutilisables) de la nuance imperfectif/perfectif,
// affichées sous chaque colonne du passé et du futur — inspirées de l'idée que
// l'imperfectif insiste sur le déroulement, le perfectif sur le résultat obtenu.
export const ASPECT_TAGLINE = {
  imp: "On insiste sur le déroulement ou l'habitude.",
  perf: "On insiste sur le résultat, une action accomplie.",
};

// ---------------------------------------------------------------------------
// 30 verbes essentiels. Chaque entrée a :
// - imp : la forme imperfective (présent + passé, futur composé calculé à l'affichage)
// - perf : la forme perfective (futur conjugué + passé), ou null si le verbe n'en a pas
// - note : une remarque grammaticale ponctuelle (mutation, irrégularité...), optionnelle
// ---------------------------------------------------------------------------
export const verbs = [
  {id:"byt", fr:"Être / Exister", icon:"✨",
    imp:{ru:"Быть", group:"irr", present:null, future:["буду","будешь","будет","будем","будете","будут"], past:["был","была","было","были"]},
    perf:null,
    note:"« Быть » n'a pratiquement pas de présent utilisé en russe moderne (sauf «есть» = il y a). Son futur (буду, будешь…) sert aussi d'auxiliaire pour former le futur de tous les autres verbes imperfectifs."
  },
  {id:"imet", fr:"Avoir", icon:"🎒",
    imp:{ru:"Иметь", group:1, present:["имею","имеешь","имеет","имеем","имеете","имеют"], past:["имел","имела","имело","имели"]},
    perf:null
  },
  {id:"delat", fr:"Faire", icon:"🛠️",
    imp:{ru:"Делать", group:1, present:["делаю","делаешь","делает","делаем","делаете","делают"], past:["делал","делала","делало","делали"]},
    perf:{ru:"Сделать", group:1, future:["сделаю","сделаешь","сделает","сделаем","сделаете","сделают"], past:["сделал","сделала","сделало","сделали"]}
  },
  {id:"govorit", fr:"Dire", icon:"💬",
    imp:{ru:"Говорить", group:2, present:["говорю","говоришь","говорит","говорим","говорите","говорят"], past:["говорил","говорила","говорило","говорили"]},
    perf:{ru:"Сказать", group:1, future:["скажу","скажешь","скажет","скажем","скажете","скажут"], past:["сказал","сказала","сказало","сказали"]}
  },
  {id:"chitat", fr:"Lire", icon:"📖",
    imp:{ru:"Читать", group:1, present:["читаю","читаешь","читает","читаем","читаете","читают"], past:["читал","читала","читало","читали"]},
    perf:{ru:"Прочитать", group:1, future:["прочитаю","прочитаешь","прочитает","прочитаем","прочитаете","прочитают"], past:["прочитал","прочитала","прочитало","прочитали"]}
  },
  {id:"pisat", fr:"Écrire", icon:"✍️",
    imp:{ru:"Писать", group:1, present:["пишу","пишешь","пишет","пишем","пишете","пишут"], past:["писал","писала","писало","писали"]},
    perf:{ru:"Написать", group:1, future:["напишу","напишешь","напишет","напишем","напишете","напишут"], past:["написал","написала","написало","написали"]},
    note:"Mutation с → ш dans toutes les formes du présent/futur (пиш-, напиш-)."
  },
  {id:"hotet", fr:"Vouloir", icon:"🌟",
    imp:{ru:"Хотеть", group:"irr", present:["хочу","хочешь","хочет","хотим","хотите","хотят"], past:["хотел","хотела","хотело","хотели"]},
    perf:{ru:"Захотеть", group:"irr", future:["захочу","захочешь","захочет","захотим","захотите","захотят"], past:["захотел","захотела","захотело","захотели"]},
    note:"Conjugaison mixte : singulier comme le groupe 1 (хочу, хочешь, хочет), pluriel comme le groupe 2 (хотим, хотите, хотят)."
  },
  {id:"moch", fr:"Pouvoir", icon:"💪",
    imp:{ru:"Мочь", group:1, present:["могу","можешь","может","можем","можете","могут"], past:["мог","могла","могло","могли"]},
    perf:{ru:"Смочь", group:1, future:["смогу","сможешь","сможет","сможем","сможете","смогут"], past:["смог","смогла","смогло","смогли"]},
    note:"Alternance г/ж (могу…можешь…могут). Au passé masculin, le л tombe : « мог », pas « могл »."
  },
  {id:"znat", fr:"Savoir", icon:"🧠",
    imp:{ru:"Знать", group:1, present:["знаю","знаешь","знает","знаем","знаете","знают"], past:["знал","знала","знало","знали"]},
    perf:null
  },
  {id:"ponimat", fr:"Comprendre", icon:"💡",
    imp:{ru:"Понимать", group:1, present:["понимаю","понимаешь","понимает","понимаем","понимаете","понимают"], past:["понимал","понимала","понимало","понимали"]},
    perf:{ru:"Понять", group:1, future:["пойму","поймёшь","поймёт","поймём","поймёте","поймут"], past:["понял","поняла","поняло","поняли"]}
  },
  {id:"videt", fr:"Voir", icon:"👀",
    imp:{ru:"Видеть", group:2, present:["вижу","видишь","видит","видим","видите","видят"], past:["видел","видела","видело","видели"]},
    perf:{ru:"Увидеть", group:2, future:["увижу","увидишь","увидит","увидим","увидите","увидят"], past:["увидел","увидела","увидело","увидели"]},
    note:"Mutation д → ж seulement à la 1ère personne du singulier (вижу, увижу)."
  },
  {id:"slyshat", fr:"Entendre", icon:"👂",
    imp:{ru:"Слышать", group:2, present:["слышу","слышишь","слышит","слышим","слышите","слышат"], past:["слышал","слышала","слышало","слышали"]},
    perf:{ru:"Услышать", group:2, future:["услышу","услышишь","услышит","услышим","услышите","услышат"], past:["услышал","услышала","услышало","услышали"]}
  },
  {id:"rabotat", fr:"Travailler", icon:"🏢",
    imp:{ru:"Работать", group:1, present:["работаю","работаешь","работает","работаем","работаете","работают"], past:["работал","работала","работало","работали"]},
    perf:{ru:"Поработать", group:1, future:["поработаю","поработаешь","поработает","поработаем","поработаете","поработают"], past:["поработал","поработала","поработало","поработали"]}
  },
  {id:"zhit", fr:"Vivre", icon:"🏡",
    imp:{ru:"Жить", group:1, present:["живу","живёшь","живёт","живём","живёте","живут"], past:["жил","жила","жило","жили"]},
    perf:{ru:"Пожить", group:1, future:["поживу","поживёшь","поживёт","поживём","поживёте","поживут"], past:["пожил","пожила","пожило","пожили"]}
  },
  {id:"lyubit", fr:"Aimer", icon:"❤️",
    imp:{ru:"Любить", group:2, present:["люблю","любишь","любит","любим","любите","любят"], past:["любил","любила","любило","любили"]},
    perf:{ru:"Полюбить", group:2, future:["полюблю","полюбишь","полюбит","полюбим","полюбите","полюбят"], past:["полюбил","полюбила","полюбило","полюбили"]},
    note:"Mutation б → бл à la 1ère personne du singulier (люблю, полюблю)."
  },
  {id:"dumat", fr:"Penser", icon:"🤔",
    imp:{ru:"Думать", group:1, present:["думаю","думаешь","думает","думаем","думаете","думают"], past:["думал","думала","думало","думали"]},
    perf:{ru:"Подумать", group:1, future:["подумаю","подумаешь","подумает","подумаем","подумаете","подумают"], past:["подумал","подумала","подумало","подумали"]}
  },
  {id:"davat", fr:"Donner", icon:"🎁",
    imp:{ru:"Давать", group:1, present:["даю","даёшь","даёт","даём","даёте","дают"], past:["давал","давала","давало","давали"]},
    perf:{ru:"Дать", group:"irr", future:["дам","дашь","даст","дадим","дадите","дадут"], past:["дал","дала","дало","дали"]},
    note:"«Дать» au futur suit un paradigme irrégulier unique, partagé par très peu de verbes russes."
  },
  {id:"vhodit", fr:"Entrer", icon:"🚪",
    imp:{ru:"Входить", group:2, present:["вхожу","входишь","входит","входим","входите","входят"], past:["входил","входила","входило","входили"]},
    perf:{ru:"Войти", group:1, future:["войду","войдёшь","войдёт","войдём","войдёте","войдут"], past:["вошёл","вошла","вошло","вошли"]}
  },
  {id:"vyhodit", fr:"Sortir", icon:"🚶",
    imp:{ru:"Выходить", group:2, present:["выхожу","выходишь","выходит","выходим","выходите","выходят"], past:["выходил","выходила","выходило","выходили"]},
    perf:{ru:"Выйти", group:1, future:["выйду","выйдешь","выйдет","выйдем","выйдете","выйдут"], past:["вышел","вышла","вышло","вышли"]}
  },
  {id:"smotret", fr:"Regarder", icon:"📺",
    imp:{ru:"Смотреть", group:2, present:["смотрю","смотришь","смотрит","смотрим","смотрите","смотрят"], past:["смотрел","смотрела","смотрело","смотрели"]},
    perf:{ru:"Посмотреть", group:2, future:["посмотрю","посмотришь","посмотрит","посмотрим","посмотрите","посмотрят"], past:["посмотрел","посмотрела","посмотрело","посмотрели"]}
  },
  {id:"slushat", fr:"Écouter", icon:"🎧",
    imp:{ru:"Слушать", group:1, present:["слушаю","слушаешь","слушает","слушаем","слушаете","слушают"], past:["слушал","слушала","слушало","слушали"]},
    perf:{ru:"Послушать", group:1, future:["послушаю","послушаешь","послушает","послушаем","послушаете","послушают"], past:["послушал","послушала","послушало","послушали"]}
  },
  {id:"pokupat", fr:"Acheter", icon:"🛍️",
    imp:{ru:"Покупать", group:1, present:["покупаю","покупаешь","покупает","покупаем","покупаете","покупают"], past:["покупал","покупала","покупало","покупали"]},
    perf:{ru:"Купить", group:2, future:["куплю","купишь","купит","купим","купите","купят"], past:["купил","купила","купило","купили"]},
    note:"Mutation п → пл à la 1ère personne du singulier du perfectif (куплю)."
  },
  {id:"uchit", fr:"Apprendre", icon:"🎓",
    imp:{ru:"Учить", group:2, present:["учу","учишь","учит","учим","учите","учат"], past:["учил","учила","учило","учили"]},
    perf:{ru:"Научить", group:2, future:["научу","научишь","научит","научим","научите","научат"], past:["научил","научила","научило","научили"]},
    note:"Version simplifiée (sans -ся) : « учить » = apprendre/mémoriser qch."
  },
  {id:"nachinat", fr:"Commencer", icon:"🚦",
    imp:{ru:"Начинать", group:1, present:["начинаю","начинаешь","начинает","начинаем","начинаете","начинают"], past:["начинал","начинала","начинало","начинали"]},
    perf:{ru:"Начать", group:1, future:["начну","начнёшь","начнёт","начнём","начнёте","начнут"], past:["начал","начала","начало","начали"]}
  },
  {id:"zakanchivat", fr:"Finir", icon:"🏁",
    imp:{ru:"Заканчивать", group:1, present:["заканчиваю","заканчиваешь","заканчивает","заканчиваем","заканчиваете","заканчивают"], past:["заканчивал","заканчивала","заканчивало","заканчивали"]},
    perf:{ru:"Кончить", group:2, future:["кончу","кончишь","кончит","кончим","кончите","кончат"], past:["кончил","кончила","кончило","кончили"]}
  },
  {id:"est", fr:"Manger", icon:"🍽️",
    imp:{ru:"Есть", group:"irr", present:["ем","ешь","ест","едим","едите","едят"], past:["ел","ела","ело","ели"]},
    perf:{ru:"Съесть", group:"irr", future:["съем","съешь","съест","съедим","съедите","съедят"], past:["съел","съела","съело","съели"]},
    note:"«Есть» a une conjugaison unique en russe, à ne pas confondre avec «есть» (= il y a)."
  },
  {id:"pit", fr:"Boire", icon:"🥤",
    imp:{ru:"Пить", group:1, present:["пью","пьёшь","пьёт","пьём","пьёте","пьют"], past:["пил","пила","пило","пили"]},
    perf:{ru:"Выпить", group:1, future:["выпью","выпьешь","выпьет","выпьем","выпьете","выпьют"], past:["выпил","выпила","выпило","выпили"]}
  },
  {id:"spat", fr:"Dormir", icon:"🛌",
    imp:{ru:"Спать", group:2, present:["сплю","спишь","спит","спим","спите","спят"], past:["спал","спала","спало","спали"]},
    perf:{ru:"Поспать", group:2, future:["посплю","поспишь","поспит","поспим","поспите","поспят"], past:["поспал","поспала","поспало","поспали"]},
    note:"Mutation п → пл à la 1ère personne du singulier (сплю)."
  },
  {id:"vstavat", fr:"Se lever", icon:"⏰",
    imp:{ru:"Вставать", group:1, present:["встаю","встаёшь","встаёт","встаём","встаёте","встают"], past:["вставал","вставала","вставало","вставали"]},
    perf:{ru:"Встать", group:1, future:["встану","встанешь","встанет","встанем","встанете","встанут"], past:["встал","встала","встало","встали"]}
  },
  {id:"pomogat", fr:"Aider", icon:"🤝",
    imp:{ru:"Помогать", group:1, present:["помогаю","помогаешь","помогает","помогаем","помогаете","помогают"], past:["помогал","помогала","помогало","помогали"]},
    perf:{ru:"Помочь", group:1, future:["помогу","поможешь","поможет","поможем","поможете","помогут"], past:["помог","помогла","помогло","помогли"]},
    note:"Même alternance г/ж que «мочь» (помогу…поможешь…помогут)."
  },
];
