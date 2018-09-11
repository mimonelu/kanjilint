#!/usr/bin/env node

const messages = {
  'deleted': '削除された常用漢字です',
  'old': '常用漢字「__KANJI__」の旧字体です',
  'uncommon': '常用漢字ではありません'
};

const program = require('commander');
program
  .version('1.0.0', '-v, --version')
  .usage('<file> [options]\ne.g. kanjilint "sample/**/*.txt" -e node_modules -o result.txt -f text -q 32')
  .option('-e, --exclude <s>', 'set a string to exclude specific file path')
  .option('-o, --output <s>', 'set output file path (default: standard output)')
  .option('-f, --format <s>', 'set output file format (json/text)', 'text')
  .option('-q, --quotation <n>', 'set quotation length', (v) => parseInt(v, 10), 32)
  .parse(process.argv);

const methods = {
  'json': (textHash, dataList) => JSON.stringify(dataList),
  'text': (textHash, dataList) => {
    let results = [];
    results.push(`全${Object.keys(textHash).length}ファイル中、${dataList.length}ファイルで非常用漢字が検出されました。`);
    dataList.forEach((data) => {
      results.push('');
      results.push(data.file);
      data.results.forEach((result, index) => {
        let message = messages[result.type];
        if (result.type === 'old') {
          message = message.replace(/__KANJI__/g, result.option.current);
        }
        results.push(`${index + 1}. ${result.line}行目（計${result.index}文字目）の「${result.kanji}」は${message}。`);
        if (program.quotation > 0) {
          const quotationIndex = result.index - Math.round(program.quotation / 2);
          let quotation = textHash[data.file].substr(quotationIndex, program.quotation + 1).replace(/(?:\r\n|\r|\n)/g, ' ');
          if (quotationIndex > 0) quotation = `...${quotation}`;
          quotation = '        '.slice(- index.toString(10).length - 2) + quotation;
          if (quotationIndex + program.quotation < textHash[data.file].length - 2) quotation = `${quotation}...`;
          results.push(quotation);
        }
      });
    });
    results = results.join('\n');
    return results;
  }
};

if (program.args[0] == null) {
  console.error('At least file path must be set.');
} else {
  const glob = require('glob');
  glob(program.args[0], { nodir: true }, (error, files) => {
    const fs = require('fs-extra');
    const encoding = require('encoding-japanese');
    const isBinary = require('is-binary');
    const kanji = require('../lib/api');
    const textHash = {};
    const dataList = [];
    files.forEach((file) => {
      if (file.indexOf(program.exclude) === - 1) {
        let buffer = fs.readFileSync(file);
        let utf8Array = Uint8Array.from(Buffer.from(buffer));
        buffer = encoding.convert(utf8Array, 'UTF8', 'AUTO');
        buffer = Buffer.from(buffer).toString();
        if (isBinary(buffer) === false) {
          textHash[file] = buffer;
          const results = kanji.parse(buffer);
          if (results.length > 0) {
            dataList.push({ file, results });
          }
        }
      }
    });
    const result = methods[program.format](textHash, dataList);
    if (program.output == null) {
      console.info(result);
    } else {
      fs.outputFileSync(program.output, result);
    }
  });
}
