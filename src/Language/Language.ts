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

/**
 * Remove duplicate words
 */
const intersectingWords = new Set();
Object.entries(Languages).forEach((l) => { // Get Duplicates
    Object.entries(Languages).forEach((l1,) => {
        if (l[0] == l1[0])
            return;

        l[1].filter(w => l1[1].includes(w)).forEach(intersectingWord => intersectingWords.add(intersectingWord));
    });
});
Object.entries(Languages).forEach((l, i) => { // Remove Duplicates
    Languages[l[0]] = l[1].filter(w => !intersectingWords.has(w));
});


let languageOfAWordMemory = {};
export function languageOfAWord(word: string) {
    word = word.toLowerCase();

    if (languageOfAWordMemory[word])
        return languageOfAWordMemory[word];

    languageOfAWordMemory[word] = Object.entries(Languages).find(l => l[1].find(w => w == word) != undefined)?.[0] ?? "unknown"

    return languageOfAWordMemory[word];
}
