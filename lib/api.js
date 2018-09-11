const list = require('../bin/list.json');
const regexp = /([一-龥])/g;
module.exports.parse = (text) => {
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
