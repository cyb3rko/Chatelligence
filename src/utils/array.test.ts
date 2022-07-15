import { top } from "./array";

const testArray: Array<{ name: string, age: number, credits: number }> = [
    { name: "Alice", age: 21, credits: 100 },
    { name: "Bob", age: 22, credits: 200 },
    { name: "Cebra", age: 30, credits: 300 },
    { name: "Dario", age: 18, credits: 400 },
];

const threeOldestSolution = [testArray[2], testArray[1], testArray[0]];
const alphabeticallyOrderedSolution = testArray;

test('top function (order by number)', () => {
    let threeOldest = top([...testArray], 3, "age");

    expect(threeOldest.length).toEqual(3);
    expect(threeOldest).toEqual(threeOldestSolution);
});


test('top function (order by string)', () => {
    let alphabeticallyOrdered = top([...testArray], 4, "name", false);

    expect(alphabeticallyOrdered.length).toEqual(4);
    expect(alphabeticallyOrdered).toEqual(alphabeticallyOrderedSolution);
});