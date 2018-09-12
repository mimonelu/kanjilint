const request = require('request');
const cheerio = require('cheerio');
const fs = require('fs');
const path = require('path');
const make = (output) => {
  request('https://ja.wikipedia.org/wiki/%E5%B8%B8%E7%94%A8%E6%BC%A2%E5%AD%97%E4%B8%80%E8%A6%A7', (error, response, body) => {
    if (error != null) {
      console.error(error);
    } else {
      const $ = cheerio.load(body);
      const json = [];
      $('#mw-content-text table').eq(1).find('tr').each((index, element) => {
        const td = $(element).find('td');
        const number = td.eq(0).text();
        const current = td.eq(1).text().replace(/\s*\[\d*\]/g, '');
        const old = td.eq(2).text().replace(/\s*\[\d*\]/g, '');
        const grade = td.eq(5).text().replace(/7S/, 'S');
        const deleted = td.eq(7).text();
        if (current !== "") {
          json.push({ number, current, old, grade, deleted });
        }
      });
      const filePath = path.resolve(__dirname, output);
      fs.writeFileSync(filePath, JSON.stringify(json));
    }
  });
};

let list = null;
const regexp = /([一-龥])/g;
const parse = (text) => {
  list = list || require('./list.json');
  const results = [];
  let match = null;
  while ((match = regexp.exec(text)) != null) {
    const kanji = match[1];
    const index = match.index;
    const lineMatch = text.substr(0, index).match(/(?:\r\n|\r|\n)/g);
    const line = lineMatch == null ? 1 : lineMatch.length + 1;
    if (list.some((item) => {
      if (item.current === kanji) {
        if (item.deleted !== "") {
          results.push({ type: 'deleted', index, line, kanji, option: item });
        }
        return true;
      } else if (item.old === kanji) {
        results.push({ type: 'old', index, line, kanji, option: item });
        return true;
      }
    }) === false) {
      results.push({ type: 'uncommon', index, line, kanji, option: null });
    }
  }
  return results;
};

module.exports = {
  make,
  parse
};
