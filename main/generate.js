const kuromoji = require('kuromoji');

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
  }
}