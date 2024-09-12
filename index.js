import { query } from 'https://lsong.org/scripts/query.js';

const parseCSV = str => {
  const lines = str.toString().split(/\r?\n/g);
  const [firstLine] = lines;
  const columns = firstLine.split(',');
  return lines
    .slice(1)
    .map(line => line
      .split(',')
      .reduce((o, p, i) => (o[columns[i]] = p, o), {})
    );
};

const compareTwoStrings = (first, second) => {
  if (!first || !second) return 0;
  first = first.replace(/\s+/g, '')
  second = second.replace(/\s+/g, '')

  if (!first.length && !second.length) return 1;
  if (!first.length || !second.length) return 0;
  if (first === second) return 1;
  if (first.length === 1 && second.length === 1) return 0;
  if (first.length < 2 || second.length < 2) return 0;

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

// API 函数
const fetchCategories = async () => {
  const response = await fetch('./data/categories.json');
  const categories = await response.json();
  return categories.reduce((o, c) => (o[c.id] = c, o), {});
};

const fetchGarbages = async () => {
  const response = await fetch('./data/garbage.csv');
  const text = await response.text();
  return parseCSV(text);
}

// 渲染函数
const renderTemplate = (templateId, data) => {
  const template = document.getElementById(templateId);
  const clone = document.importNode(template.content, true);

  Object.entries(data).forEach(([key, value]) => {
    const element = clone.querySelector(`.${key}`) || clone.querySelector(`[name="${key}"]`);
    if (element) {
      if (element.tagName === 'IMG') {
        element.src = value;
      } else {
        element.textContent = value;
      }
    }
  });

  return clone;
}

// 主函数
const init = async () => {
  const { q } = query;
  const input = document.querySelector('input[name="q"]');
  const results = document.querySelector('#results');
  const categoriesContainer = document.querySelector('#categories');

  if (q) {
    input.value = q;
    const [categories, garbages] = await Promise.all([fetchCategories(), fetchGarbages()]);

    const matchedGarbages = garbages
      .map(x => ({ ...x, score: compareTwoStrings(x.name, q) }))
      .filter(x => x.score)
      .sort((a, b) => b.score - a.score);

    matchedGarbages.forEach(item => {
      item.category = categories[item.sortId];
      const resultElement = renderTemplate('result-template', {
        'garbage-name': item.name,
        'garbage-category': item.category.name
      });
      resultElement.querySelector('.garbage').style.color = item.category.color;
      resultElement.querySelector('.garbage-category').style.backgroundColor = item.category.bgcolor;
      results.appendChild(resultElement);
    });

    const reportElement = renderTemplate('report-template', {});
    reportElement.querySelector('a').href = `https://github.com/lsongdev/garbage-recycle/issues/new?title=${encodeURIComponent(q)}`;
    results.appendChild(reportElement);
  } else {
    const categories = await fetchCategories();
    console.log(categories);
    Object.values(categories).forEach(item => {
      const categoryElement = renderTemplate('category-template', item);
      categoriesContainer.appendChild(categoryElement);
    });
  }
}

// 初始化
document.addEventListener('DOMContentLoaded', init);