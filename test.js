const emotion = require('./main/emotion');
const kuromoji = require('kuromoji');

(async function test () {
  let text = 'waryuさん食う';
  kuromoji.builder({
    dicPath: `${__dirname}/node_modules/kuromoji/dict`
  }).build(async (err, tokenizer) => {
    if(err) console.error(err);
    let result = await emotion.analysis(tokenizer.tokenize(text));
    console.log('result:', result);
  });
})();