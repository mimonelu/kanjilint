const request = require('request');
const cheerio = require('cheerio');
const fs = require('fs');
const path = require('path');
const pressJson = require('./press.json');
const make = (output) => {
  request('https://ja.wikipedia.org/wiki/%E5%B8%B8%E7%94%A8%E6%BC%A2%E5%AD%97%E4%B8%80%E8%A6%A7', (error, response, body) => {
    if (error != null) {
      console.error(error);
    } else {
      const $ = cheerio.load(body);
      const json = [];
      $('#mw-content-text table').eq(1).find('tr').each((index, element) => {
        const td = $(element).find('td');
        const current = td.eq(1).text().replace(/\s*\[\d*\]/g, '');
        if (current !== '') {

          // 常用漢字の通し番号
          const number = td.eq(0).text();

          // 常用漢字の旧字体
          const old = td.eq(2).text().replace(/\s*\[\d*\]/g, '');

          // 常用漢字を学習する学年（数字は小学校、「S」は中学校以上）
          const grade = td.eq(5).text().replace(/7S/, 'S');

          // 常用漢字から削除された年数
          const deleted = td.eq(7).text();

          // 新聞常用漢字では削除された漢字
          let press = '';
          if (pressJson.deleted.indexOf(current) !== - 1) {
            press = 'deleted';
          }

          json.push({ number, current, old, grade, deleted, press });
        }
      });

      // 新聞常用漢字で追加された漢字
      pressJson.added.forEach((add) => {
        json.push({ 'number': '', 'current': add, 'old': '', 'grade': '', 'deleted': '', 'press': 'added' });
      });

      const filePath = path.resolve(__dirname, output);
      fs.writeFileSync(filePath, JSON.stringify(json));
    }
  });
};

let list = null;
const regexp = /([一-龥])/g;
const parse = (text, isPress = true) => {
  list = list || require('./list.json');
  const results = [];
  let match = null;
  while ((match = regexp.exec(text)) != null) {

    // 解析の対象となる漢字
    const kanji = match[1];

    // 先頭からの文字数
    const index = match.index;

    // 行数
    const lineMatch = text.substr(0, index).match(/(?:\r\n|\r|\n)/g);
    const line = lineMatch == null ? 1 : lineMatch.length + 1;

    if (list.some((item) => {
      if (item.current === kanji) {

        // 削除された常用漢字
        if (item.deleted !== '') {
          results.push({ type: 'deleted', index, line, kanji, option: item });
        }

        // 新聞常用漢字で追加された常用漢字
        else if (isPress === true && item.press === 'added') {
          results.push({ type: 'press_added', index, line, kanji, option: item });
        }

        // 新聞常用漢字で削除された常用漢字
        else if (isPress === true && item.press === 'deleted') {
          results.push({ type: 'press_deleted', index, line, kanji, option: item });
        }

        return true;

      // 常用漢字の旧字体
      } else if (item.old === kanji) {
        results.push({ type: 'old', index, line, kanji, option: item });
        return true;
      }

    // 非常用漢字
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
