import Chinese from './datasets/Chinese';
import Czech from './datasets/Czech';
import Danish from './datasets/Danish';
import Dutch from './datasets/Dutch';
import English from './datasets/English';
import French from './datasets/French';
import German from './datasets/German';
import Greek from './datasets/Greek';
import Hindi from './datasets/Hindi';
import Italian from './datasets/Italian';
import Spanish from './datasets/Spanish';

export const Languages: { [key: string]: string[] } = {
    Chinese,
    Czech,
    Danish,
    Dutch,
    English,
    French,
    German,
    Greek,
    Hindi,
    Italian,
    Spanish
}

/**
 * Make all word lowercase
 */
Object.entries(Languages).forEach((l, i) => {
    l[1].forEach((w, j) => {
        l[1][j] = w.toLowerCase();
    })
});

export function languagesOfAWord(word: string) {
    word = word.toLowerCase();

    let langs = [];
    Object.entries(Languages).forEach(l => {
        if (l[1].indexOf(word) != -1) {
            langs.push(l[0]);
        }
    });

    if (langs.length == 0)
        langs.push("unknown");

    return langs;
}

export function getLanguagesOfString(sentence: string): { [lang: string]: number } {
    const langs = {};
    sentence.split(" ").forEach(word => {
        languagesOfAWord(word).forEach(lang => {
            langs[lang] = (langs[lang] ?? 0) + 1
        })
    });

    return langs;
}
