const fs = require('fs');
const util = require('util');
const categories = require('./data/categories');

const readFile = util.promisify(fs.readFile);

const parseCSV = str => {
  const lines = str
    .toString()
    .split(/\r?\n/g);
  const [firstLine] = lines;
  const columns = firstLine.split(',');
  return lines
    .slice(1)
    .map(line => line
      .split(',')
      .reduce((o, p, i) => (o[columns[i]] = p, o), {})
    );
};

function compareTwoStrings(first, second) {
  if(!first || !second) return 0;
  first = first.replace(/\s+/g, '')
  second = second.replace(/\s+/g, '')

  if (!first.length && !second.length) return 1;           // if both are empty strings
  if (!first.length || !second.length) return 0;           // if only one is empty string
  if (first === second) return 1;       							     // identical
  if (first.length === 1 && second.length === 1) return 0; // both are 1-letter strings
  if (first.length < 2 || second.length < 2) return 0;     // if either is a 1-letter string

  let firstBigrams = new Map();
  for (let i = 0; i < first.length - 1; i++) {
    const bigram = first.substring(i, i + 2);
    const count = firstBigrams.has(bigram)
      ? firstBigrams.get(bigram) + 1
      : 1;

    firstBigrams.set(bigram, count);
  };

  let intersectionSize = 0;
  for (let i = 0; i < second.length - 1; i++) {
    const bigram = second.substring(i, i + 2);
    const count = firstBigrams.has(bigram)
      ? firstBigrams.get(bigram)
      : 0;

    if (count > 0) {
      firstBigrams.set(bigram, count - 1);
      intersectionSize++;
    }
  }

  return (2.0 * intersectionSize) / (first.length + second.length - 2);
}

const garbageRecycle = async () => {
  const garbages = await Promise
    .resolve('./data/garbage.csv')
    .then(readFile)
    .then(parseCSV)
  return keyword => garbages
    .map(x => (x.score = compareTwoStrings(keyword, x.name), x))
    .filter(x => x.score)
    .sort((a, b) => b.score - a.score)
};

garbageRecycle.categories = categories;

module.exports = garbageRecycle;