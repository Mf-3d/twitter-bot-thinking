const kuromoji = require('kuromoji');
const isIncludes = (arr, target) => arr.some(el => target.includes(el));

const symbol = ['/', '\\', ',', '.', '、', '。', '？', '！', '?', '!', '<', '>', '＜', '＞', '_', '＿', '（', '）', '(', ')', '-'];

module.exports = {
  /** 
   * @return {Promise<kuromoji.IpadicFeatures[]>}
   */
  async tokenize(text) {
    let result = new Promise((resolve) => {
      kuromoji.builder({
        dicPath: `${__dirname}/../node_modules/kuromoji/dict`
      }).build((err, tokenizer) => {
      
        resolve(tokenizer.tokenize(text));
      });
    });
    return result;
  },

  async connect(word, template = `
    123456🤔
    ※ボットのテストです
    `) {
    if(word[3] === 'て') word[3] = 'が';
    if(word[4][word[4].length - 1] === 'よ' && word[5][0] === 'た') word[5] = 'か';
    if(word[4][word[4].length - 1] !== 'だ' && word[5] === 'しな') word[4] = 'だ';
    if(word[4][word[4].length - 1] !== 'る' && word[5][0] === 'た') word[5][0] = 'か';
    if(word[4][word[4].length - 1] === 'よ' && word[5][0] === 'ま') word[5][0] = 'で';
    if(word[1] === 'て' && word[3] === 'から') word[1] === 'が';
    if(word[4][word[4].length - 1] === 'わ' && word[5][0] === 'た') word[5] = 'れた';
    if(word[1][word[1].length - 1] === 'て' && word[3][0] === 'に') word[5] = 'は';
    if(word[4][word[4].length - 1] === '寝' && word[5] === 'う') word[5] = 'る';
    if(word[4][word[4].length - 1] === 'よ' && word[5][0] === 'た') word[5] = 'う';
    if(word[4].includes('った') && word[5][0] === 'い') word[5][0] = '';
    if(word[4][word[4].length - 1] === 'わ' && word[5][0] === 'は') word[5] = '';
    if(word[4][word[4].length - 1] === 'ら' && word[5][0] === 'う') word[5] = 'す';
    if(word[1][word[1].length - 1] === 'の' && word[3][0] === 'の') word[3] = 'を';
    if(word[4].includes('た') && word[5][0] === 'ら') word[5][0] = '';
    if(word[4][word[4].length - 1]　 !== 'ま' && word[5][0] === 'う') word[5][0] = 'た';
    if(word[4][word[4].length - 1]　 === 'う' && word[5][0] !== 'ぞ') word[5] = '';
    if(word[4][word[4].length - 1]　 === 'っ' && word[5][0] === 'だ') word[5] = 'た';
    if(word[4][word[4].length - 1]　 === 'っ' && word[5][0] === 'な') word[5] = 'たな';
    if(word[4][word[4].length - 1]　 === 'っ' && word[5][0] === 'う') word[5] = 'た';
    if(word[1] === 'が' && word[3] === 'は') {
      word[1] = 'は';
      word[3] = 'で';
    }
    if(word[5][word[5].length - 1] === 'っ') word[5] = word[5] + 'た';
    if(word[3][word[3].length - 1] === 'か') word[3] = 'が'; 
    if(word[1][word[1].length - 1] === 'に' && word[3][word[1].length - 1] === 'に') word[3] = 'が'; 
    if(word[4][word[4].length - 1] === 'る' && word[5][0] === 'た') word[5] = 'ん';  
    if(word[1] === word[3]) word[3] = 'で';  
    if(word[4][word[4].length - 1] === 'う' && word[5][0] === 'た') word[4][word[4].length - 1] = 'っ';
    if(word[1][word[1].length - 1] === 'て' && word[3][0] === 'を') word[3] = 'で';
    if(word[4][word[4].length - 1]　 === 'っ' && word[5][0] === 'ま') word[5] = 'たわ';
    if(word[5][word[5].length - 1] === 'し') word[5] = 'した';
    if(word[4][word[4].length - 1]　 === '寝' && word[5][0] === 'だ') word[5] = 'た';
    if(word[1][word[1].length - 1] === 'を' && word[3][0] === 'の') {
      word[1] = 'の';
      word[3] = 'が';
    }
    if(word[4][word[4].length - 1]　 === 'ら' && word[5][0] === 'だ') word[5] = 'せた';
    if(word[3][word[3].length - 1]　 === 'の') word[5] = 'が';
    if(word[4][word[4].length - 1]　 === 'い' && word[5][0] === 'だ') word[5] = 'た';
    if(word[4][word[4].length - 1]　 === 'る' && word[5][0] !== 'な') word[5] = '';
    if(word[3][word[3].length - 1]　 === 'が' && word[4][0] === 'て') word[4][0] = 'い';
    if(word[4][word[4].length - 1]　 === '寝' && word[5][0] === 'し') word[5] = 'た';
    if(isIncludes(symbol, word[0])) word[0] = 'わりゅ';
    if(isIncludes(symbol, word[2])) word[2] = 'Sorakime';
    if(word[4][word[4].length - 1]　 === 'え' && word[5][0] !== 'う') word[5] = 'るのか';
    if(word[3][word[3].length - 1]　 === 'で' && word[4][0] === '来') word[5] = '着';
    if(word[3][word[3].length - 1]　 === 'ぜ') word[5] = 'が';
    if(word[4][word[4].length - 1]　 === 'ら' && word[5][0]　 === 'た') word[5] = 'れた';
    
    let result = template
    .replace('1', word[0])  // 名詞
    .replace('2', word[1])  // 助詞
    .replace('3', word[2])  // 名詞
    .replace('4', word[3])  // 助詞
    .replace('5', word[4])  // 動詞
    .replace('6', word[5]); // 助動詞

    return result;
  }
}