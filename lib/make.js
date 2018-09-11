const request = require('request');
request('https://ja.wikipedia.org/wiki/%E5%B8%B8%E7%94%A8%E6%BC%A2%E5%AD%97%E4%B8%80%E8%A6%A7', (error, response, body) => {
  if (error != null) {
    console.error(error);
  } else {
    const cheerio = require('cheerio');
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
    const fs = require('fs');
    const path = require('path');
    const filePath = path.resolve(__dirname, '../bin/list.json');
    fs.writeFileSync(filePath, JSON.stringify(json));
  }
});
