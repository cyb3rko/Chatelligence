import { getLanguagesOfString, Languages, languagesOfAWord } from "./Language";

const GermanWords = ["Als", "Ich", "Formular"];

test('Detect german words', () => {
    GermanWords.forEach(word => expect(languagesOfAWord(word)).toContainEqual("German"));
});
