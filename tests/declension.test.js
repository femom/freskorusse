import { describe, it, expect } from "vitest";
import { decline, analyze, toTexts, CASES } from "../src/lib/declension.js";

// Chaque ligne : [mot, options, [sg gen, dat, acc, ins, pre], [pl nom, gen, dat, acc, ins, pre]].
// Les formes attendues viennent de la grammaire standard et ont été relues une par une ;
// toute modification du moteur doit continuer à les produire.
const WORDS = [
  ["студент", { animate: true }, "студента студенту студента студентом студенте", "студенты студентов студентам студентов студентами студентах"],
  ["город", {}, "города городу город городом городе", "города городов городам города городами городах"],
  ["дом", {}, "дома дому дом домом доме", "дома домов домам дома домами домах"],
  ["стол", {}, "стола столу стол столом столе", "столы столов столам столы столами столах"],
  ["лес", {}, "леса лесу лес лесом лесе", "леса лесов лесам леса лесами лесах"],
  ["урок", {}, "урока уроку урок уроком уроке", "уроки уроков урокам уроки уроками уроках"],
  ["кусок", {}, "куска куску кусок куском куске", "куски кусков кускам куски кусками кусках"],
  ["отец", { animate: true }, "отца отцу отца отцом отце", "отцы отцов отцам отцов отцами отцах"],
  ["врач", { animate: true }, "врача врачу врача врачом враче", "врачи врачей врачам врачей врачами врачах"],
  ["учитель", { animate: true }, "учителя учителю учителя учителем учителе", "учителя учителей учителям учителей учителями учителях"],
  ["словарь", {}, "словаря словарю словарь словарём словаре", "словари словарей словарям словари словарями словарях"],
  ["музей", {}, "музея музею музей музеем музее", "музеи музеев музеям музеи музеями музеях"],
  ["санаторий", {}, "санатория санаторию санаторий санаторием санатории", "санатории санаториев санаториям санатории санаториями санаториях"],
  ["день", {}, "дня дню день днём дне", "дни дней дням дни днями днях"],
  ["брат", { animate: true }, "брата брату брата братом брате", "братья братьев братьям братьев братьями братьях"],
  ["друг", { animate: true }, "друга другу друга другом друге", "друзья друзей друзьям друзей друзьями друзьях"],
  ["человек", { animate: true }, "человека человеку человека человеком человеке", "люди людей людям людей людьми людях"],
  ["ребёнок", { animate: true }, "ребёнка ребёнку ребёнка ребёнком ребёнке", "дети детей детям детей детьми детях"],
  ["книга", {}, "книги книге книгу книгой книге", "книги книг книгам книги книгами книгах"],
  ["комната", {}, "комнаты комнате комнату комнатой комнате", "комнаты комнат комнатам комнаты комнатами комнатах"],
  ["девушка", { animate: true }, "девушки девушке девушку девушкой девушке", "девушки девушек девушкам девушек девушками девушках"],
  ["ручка", {}, "ручки ручке ручку ручкой ручке", "ручки ручек ручкам ручки ручками ручках"],
  ["тарелка", {}, "тарелки тарелке тарелку тарелкой тарелке", "тарелки тарелок тарелкам тарелки тарелками тарелках"],
  ["сестра", { animate: true }, "сестры сестре сестру сестрой сестре", "сёстры сестёр сёстрам сестёр сёстрами сёстрах"],
  ["мама", { animate: true }, "мамы маме маму мамой маме", "мамы мам мамам мам мамами мамах"],
  ["мужчина", { animate: true }, "мужчины мужчине мужчину мужчиной мужчине", "мужчины мужчин мужчинам мужчин мужчинами мужчинах"],
  ["неделя", {}, "недели неделе неделю неделей неделе", "недели недель неделям недели неделями неделях"],
  ["семья", {}, "семьи семье семью семьёй семье", "семьи семей семьям семьи семьями семьях"],
  ["дядя", { animate: true }, "дяди дяде дядю дядей дяде", "дяди дядей дядям дядей дядями дядях"],
  ["станция", {}, "станции станции станцию станцией станции", "станции станций станциям станции станциями станциях"],
  ["Россия", {}, "России России Россию Россией России", "России Россий Россиям России Россиями Россиях"],
  ["дверь", {}, "двери двери дверь дверью двери", "двери дверей дверям двери дверями дверях"],
  ["ночь", {}, "ночи ночи ночь ночью ночи", "ночи ночей ночам ночи ночами ночах"],
  ["мать", { animate: true }, "матери матери мать матерью матери", "матери матерей матерям матерей матерями матерях"],
  ["окно", {}, "окна окну окно окном окне", "окна окон окнам окна окнами окнах"],
  ["слово", {}, "слова слову слово словом слове", "слова слов словам слова словами словах"],
  ["письмо", {}, "письма письму письмо письмом письме", "письма писем письмам письма письмами письмах"],
  ["море", {}, "моря морю море морем море", "моря морей морям моря морями морях"],
  ["здание", {}, "здания зданию здание зданием здании", "здания зданий зданиям здания зданиями зданиях"],
  ["время", {}, "времени времени время временем времени", "времена времён временам времена временами временах"],
  ["имя", {}, "имени имени имя именем имени", "имена имён именам имена именами именах"],
  ["сердце", {}, "сердца сердцу сердце сердцем сердце", "сердца сердец сердцам сердца сердцами сердцах"],
  ["яблоко", {}, "яблока яблоку яблоко яблоком яблоке", "яблоки яблок яблокам яблоки яблоками яблоках"],
];

describe("déclinaison : formes vérifiées", () => {
  WORDS.forEach(([word, options, sgExpected, plExpected]) => {
    it(word, () => {
      const r = decline(word, options);
      expect(r.ok).toBe(true);
      const t = toTexts(r);
      expect(["gen", "dat", "acc", "ins", "pre"].map((c) => t.sg[c]).join(" ")).toBe(sgExpected);
      expect(CASES.map((c) => t.pl[c]).join(" ")).toBe(plExpected);
      expect(t.sg.nom.toLowerCase()).toBe(word.toLowerCase());
    });
  });
});

describe("déclinaison : règles et réglages", () => {
  it("l'accent tonique décide entre -ем et -ом après ж, ш, ч, щ, ц", () => {
    expect(decline("врач", { stressed: false }).sg.ins.text).toBe("врачем");
    expect(decline("врач", { stressed: true }).sg.ins.text).toBe("врачом");
    expect(decline("муж", { animate: true }).sg.ins.text).toBe("мужем");
  });
  it("après г, к, х, ж, ш, ч, щ : -и et jamais -ы", () => {
    expect(decline("книга").pl.nom.text).toBe("книги");
    expect(decline("сумка").sg.gen.text).toBe("сумки");
    expect(decline("нож").pl.nom.text).toBe("ножи");
  });
  it("les mots en -ь féminins en -ж/-ш/-ч/-щ prennent -ам/-ами/-ах", () => {
    const r = toTexts(decline("вещь"));
    expect(r.pl.dat + " " + r.pl.ins + " " + r.pl.pre).toBe("вещам вещами вещах");
  });
  it("un mot en -ь demande le genre, et le choix change tout", () => {
    expect(decline("словарь").controls.gender).toBe(true);
    expect(decline("тетрадь").options.gender).toBe("F");
    expect(decline("тетрадь").sg.ins.text).toBe("тетрадью");
    expect(decline("корень", { gender: "M", fleeting: true }).sg.gen.text).toBe("корня");
    expect(decline("корень", { gender: "M", fleeting: false }).sg.gen.text).toBe("кореня");
  });
  it("accusatif : masculin animé = génitif, inanimé = nominatif", () => {
    expect(decline("стол").sg.acc.text).toBe("стол");
    expect(decline("брат", { animate: true }).sg.acc.text).toBe("брата");
    expect(decline("стол").pl.acc.text).toBe("столы");
    expect(decline("студент", { animate: true }).pl.acc.text).toBe("студентов");
  });
  it("accusatif féminin en -а : -у, même pour un être animé", () => {
    expect(decline("сестра", { animate: true }).sg.acc.text).toBe("сестру");
    expect(decline("сестра").sg.acc.text).toBe("сестру");
  });
  it("prépositionnel en -у (locatif) signalé pour les mots concernés", () => {
    expect(decline("лес").loc.text).toBe("лесу");
    expect(decline("мост").loc.text).toBe("мосту");
    expect(decline("город").loc).toBeNull();
    expect(decline("угол").loc.text).toBe("углу");
  });
  it("la partie à surligner est bien la terminaison", () => {
    const r = decline("книга");
    expect(r.sg.gen).toMatchObject({ stem: "книг", end: "и" });
    expect(r.sg.nom.end).toBe("");
    expect(r.pl.gen).toMatchObject({ stem: "книг", end: "" });
  });
  it("un irrégulier avertit au lieu de laisser croire que tout est régulier", () => {
    const r = decline("человек");
    expect(r.irregular).toBe(true);
    expect(r.notes.join(" ")).toMatch(/люди/);
  });
  it("le génitif pluriel incertain est signalé", () => {
    const r = decline("лампа");
    expect(r.warnings.length).toBeGreaterThan(0);
    expect(decline("книга").warnings).toHaveLength(0);
  });
  it("les contrôles n'apparaissent que quand ils ont un effet", () => {
    expect(decline("книга").controls).toEqual({ gender: false, fleeting: false, stressed: false });
    expect(decline("врач").controls.stressed).toBe(true); // -ч : l'accent change la terminaison
    expect(decline("человек").controls.stressed).toBe(false); // irrégulier : formes imposées par le lexique
    expect(decline("американец").controls.fleeting).toBe(true);
    expect(decline("кусок").controls.fleeting).toBe(true);
    expect(decline("урок").options.fleeting).toBe(false);
  });
});

describe("déclinaison : mots non pris en charge", () => {
  it("adjectif", () => expect(analyze("красный")).toMatchObject({ ok: false, reason: "adjective" }));
  it("invariable", () => expect(analyze("кофе")).toMatchObject({ ok: false, reason: "invariable" }));
  it("pluriel connu : renvoie vers le singulier", () => {
    const r = analyze("друзья");
    expect(r.reason).toBe("plural");
    expect(r.message).toMatch(/друг/);
  });
  it("saisie vide, latine ou avec espace", () => {
    expect(analyze("").reason).toBe("empty");
    expect(analyze("book").reason).toBe("not-cyrillic");
    expect(analyze("два слова").reason).toBe("not-cyrillic");
  });
  it("ignore les accents toniques et traite un mot tout en capitales comme un mot ordinaire", () => {
    expect(decline("Мо́ре").word).toBe("море");
    expect(decline("КНИГА").sg.gen.text).toBe("книги");
  });
  it("conserve la majuscule d'un nom propre", () => {
    const r = decline("Москва");
    expect(r.sg.gen.text).toBe("Москвы");
    expect(r.sg.pre.text).toBe("Москве");
    expect(r.sg.gen).toMatchObject({ stem: "Москв", end: "ы" });
  });
});
