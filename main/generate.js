const kuromoji = require("kuromoji");
const fs = require("fs");
const isIncludes = (arr, target) => arr.some((el) => target.includes(el));
const templates = JSON.parse(fs.readFileSync(`${__dirname}/../template.db`));
const action = require("./action");

const symbol = [
  "/",
  "\\",
  ",",
  ".",
  "、",
  "。",
  "？",
  "！",
  "?",
  "!",
  "<",
  ">",
  "＜",
  "＞",
  "_",
  "＿",
  "（",
  "）",
  "(",
  ")",
  "-",
  "「",
  "」",
  "：",
  "；",
  ":",
  ";",
];

module.exports = {
  /**
   * @return {Promise<kuromoji.IpadicFeatures[]>}
   */
  async tokenize(text) {
    let result = new Promise((resolve) => {
      kuromoji
        .builder({
          dicPath: `${__dirname}/../node_modules/kuromoji/dict`,
        })
        .build((err, tokenizer) => {
          resolve(tokenizer.tokenize(text));
        });
    });
    return result;
  },

  getData(pos = "名詞") {
    /** @type {{text: string, pos: string}[]} */
    let dict = JSON.parse(
      fs.readFileSync(`${__dirname}/../dictionary.db`)
    ).dict;
    let result = [];

    dict.forEach((word) => {
      if (word.pos !== pos) return;

      result[result.length] = word;
    });

    return result;
  },

  async connect(word, template) {
    const character = await action.getCharacter();

    function getData(pos = "名詞") {
      /** @type {{text: string, pos: string}[]} */
      let dict = JSON.parse(
        fs.readFileSync(`${__dirname}/../dictionary.db`)
      ).dict;
      let result = [];

      dict.forEach((word) => {
        if (!word) console.log(dict.indexOf(word))
        //if (word.pos !== pos) return;

        result[result.length] = word;
      });

      return result;
    }

    function wordGen(part, detail) {
      const wordTemp = {
        pos: part,
        word: getData(part)[
          Math.floor(Math.random() * (getData(part).length - 1 - 0) + 0)
        ].text,
        detail: detail,
      };
      return wordTemp;
    }

    let particle_before_verb = [];
    let normal_particles = [];

    if (!template) {
      let useTemplateId =
        Math.floor(Math.random() * (templates.template.length - 1 - 1)) + 1;
      template = templates.template[useTemplateId];
      if (template.length > 10) {
        template = `
        123456🤔
        ※ボットのテストです
        `;
      }

      word = [];

      template.forEach((part, i) => {
        switch (part) {
          case "動詞":
            if (template[i + 2]) {
              word[word.length] = wordGen(part, part);
            } else {
              if (template[i + 1] === "記号") {
                word[word.length] = wordGen(part, "clause");
              } else {
                word[word.length] = wordGen(part, part);
              }
            }
            break;
          case "助詞":
            switch (template[i + 1]) {
              case "動詞":
                word[word.length] = wordGen(part, "particle_before_verb");
                break;
              case "名詞":
                word[word.length] = wordGen(part, "normal_particle");
                break;
              default:
                word[word.length] = wordGen(part, part);
            }
            break;
          case "助動詞":
            if (template[i + 2]) {
              word[word.length] = wordGen(part, part);
            } else {
              if (template[i + 1] === "記号") {
                word[word.length] = wordGen(part, "clause");
              }
            }
          default:
            word[word.length] = wordGen(part, part);
        }

        if (isIncludes(symbol, word[word.length - 1].word)) {
          word[word.length - 1].word = "😟";
        }
      });
    }

    function setValue(pos, value) {
      if (pos === "particle_before_verb") {
        particle_before_verb.forEach((pos, i) => {
          pos = value;
        });
      } else {
        normal_particles;
      }
    }

    word.forEach((wordData, i) => {
      try {
        if (wordData.detail === "clause") {
          wordData.word =
            character.character.end_of_words[
              Math.floor(
                Math.random() *
                  (character.character.end_of_words.length - 1 - 0) +
                  0
              )
            ];
        }

        if (word[i].word === "て" && word[i].detail === "particle_before_verb")
          word[i].word = "が";
        if (word[i].word === "の" && word[i].detail === "particle_before_verb")
          word[i].word = "で";

        if (isIncludes(symbol, wordData.word) && wordData.detail === "名詞")
          wordData.word === "CPU";
        if (word[i].word === "てる" && word[i].pos === "動詞")
          word[i].word = "似てる";
        if (word[i].word === "まし" && word[i].pos === "助動詞")
          word[i].word = "し";
        if (wordData.pos === "助詞" && wordData.word === "ね") {
          wordData.word = "な";
        }
        if (
          word[i].detail === "particle_before_verb" &&
          wordData.word === "な"
        ) {
          wordData.word = "で";
        }

        if (word[i - 1]) {
          if (
            word[i - 1].word[word[i - 1].length - 1] === "る" &&
            word[i - 1].pos === "動詞" &&
            wordData.word[0] === "だ" &&
            wordData.pos === "助動詞"
          )
            word[i].word = "たよ";
          if (
            word[i - 1].word[word[i - 1].length - 1] === "寝" &&
            word[i - 1].pos === "動詞" &&
            wordData.word[0] === "し" &&
            wordData.pos === "助動詞"
          )
            word[i].word = "し";
          if (
            word[i - 1].word[word[i - 1].length - 1] === "る" &&
            word[i - 1].pos === "動詞" &&
            wordData.word[0] === "ない" &&
            wordData.pos === "助動詞"
          )
            word[i].word = "んよ";
          if (
            word[i - 1].word[word[i - 1].length - 1] === "い" &&
            word[i - 1].pos === "動詞" &&
            wordData.word[0] === "や" &&
            wordData.pos === "助動詞"
          )
            word[i].word = "てたんよ怖かった";
          if (wordData.word === "て" && wordData.pos === "助詞")
            wordData.word = "ってな、";
          if (
            word[i - 1].word[word[i - 1].length - 1] === "っ" &&
            word[i - 1].pos === "動詞" &&
            wordData.word[0] === "な" &&
            wordData.pos === "助動詞"
          )
            wordData.word = "てたな";
          if (
            word[i - 1].word[word[i - 1].length - 1] === "る" &&
            word[i - 1].pos === "動詞" &&
            wordData.word[0] === "た" &&
            wordData.pos === "助動詞"
          )
            wordData.word = "わほんまに、";
          if (
            word[i - 1].word[word[i - 1].length - 1] === "っ" &&
            word[i - 1].pos === "動詞" &&
            wordData.word[0] === "な" &&
            wordData.pos === "助動詞"
          )
            wordData.word = "てたな";
          if (
            word[i - 1].word[word[i - 1].length - 1] === "さ" &&
            word[i - 1].pos === "動詞" &&
            wordData.word[0] === "な" &&
            wordData.pos === "助動詞"
          )
            wordData.word = "";
        }

        if (word[i - 2]) {
          if (
            wordData.word === word[i - 2].word &&
            wordData.detail === "particle_before_verb" &&
            word[i - 2].pos === "助詞"
          ) {
            wordData.word = "へ";
            word[i - 2].word = "が";
          }

          if (
            word[i - 2].word === "て" &&
            word[i].word === "に" &&
            word[i].detail === "particle_before_verb"
          )
            word[i].word = "は";
          if (
            word[i - 2].word === "て" &&
            wordData.word === "から" &&
            wordData.detail === "particle_before_verb" &&
            word[i - 2].detail === "normal_particle"
          )
            word[i - 2].word === "が";

          if (
            word[i].word === "の" &&
            word[i - 2] === "の" &&
            word[i - 2].detail === "normal_particle"
          )
            word[i - 2].word = "を";
          if (
            wordData.word === "か" &&
            wordData.detail === "particle_before_verb"
          )
            wordData.word = "が";
          if (
            word[wordData.i - 2] === "が" &&
            word[wordData.i - 2].detail === "normal_particle" &&
            wordData.detail === "particle_before_verb"
          ) {
            word[wordData.i - 2] = "は";
            wordData.word = "で";
          }
          if (
            word[wordData.i - 2] === "に" &&
            word[wordData.i - 2].detail === "normal_particle" &&
            wordData.detail === "particle_before_verb" &&
            wordData.word.includes("を")
          ) {
            word[wordData.i - 2] = "が";
            wordData.word = "で";
          }
          if (
            word[wordData.i - 2] === "に" &&
            word[wordData.i - 2].detail === "normal_particle" &&
            wordData.detail === "particle_before_verb" &&
            wordData.word.includes("の")
          ) {
            word[wordData.i - 2] = "が";
            wordData.word = "を";
          }
          if (
            word[wordData.i - 2] === "て" &&
            word[wordData.i - 2].detail === "normal_particle" &&
            wordData.detail === "particle_before_verb" &&
            wordData.word.includes("の")
          ) {
            word[wordData.i - 2] = "て";
            wordData.word = "に";
          }
          if (
            word[wordData.i - 2] === "しか" &&
            word[wordData.i - 2].detail === "normal_particle" &&
            wordData.detail === "particle_before_verb" &&
            wordData.word.includes("の")
          ) {
            word[wordData.i - 2] = "だけ";
            wordData.word = "";
          }
        }

        if (
          word[i].word[wordData.word.length - 1] === "し" &&
          wordData.detail === "動詞" &&
          word[i + 1].word[0] === "だ" &&
          word[i + 1].detail === "助動詞"
        )
          word[i + 1].word = "たんだっけか";
        if (
          word[i].word[wordData.word.length - 1] === "っ" &&
          wordData.detail === "動詞" &&
          word[i + 1].word[0] === "う" &&
          word[i + 1].detail === "助動詞"
        )
          word[i + 1].word = "てね";
        if (
          word[i].word[wordData.word.length - 1] === "う" &&
          wordData.detail === "動詞" &&
          word[i + 1].word[0] === "た" &&
          word[i + 1].detail === "助動詞"
        )
          word[i + 1].word = "か";
        if (
          word[i].word[wordData.word.length - 1] === "う" &&
          wordData.detail === "動詞" &&
          word[i + 1].word[0] === "だ" &&
          word[i + 1].detail === "助動詞"
        )
          wordData.word = "あっ";

        if (
          wordData.word[0] === "だ" &&
          wordData.detail === "助動詞" &&
          word[i - 1].word[word[i - 1].length - 1] === "っ" &&
          word[i - 1].detail === "動詞"
        )
          wordData.word = "た";
        if (
          wordData.word === "う" &&
          wordData.detail === "助動詞" &&
          word[i - 1].word[word[i - 1].length - 1] === "き" &&
          word[i - 1].detail === "動詞"
        )
          wordData.word = "いたわ";
        if (
          wordData.word[0] === "だ" &&
          wordData.detail === "助動詞" &&
          word[i - 1].word[word[i - 1].length - 1] === "寝" &&
          word[i - 1].detail === "動詞"
        )
          wordData.word = "た";
        if (
          wordData.word === "だ" &&
          wordData.detail === "助動詞" &&
          word[i - 1].word[word[i - 1].length - 1] === "る" &&
          word[i - 1].detail === "動詞"
        )
          wordData.word = "か";
        if (
          wordData.word[wordData.word.length - 1] === "っ" &&
          wordData.detail === "動詞" &&
          word[i + 1].word[0] === "ま" &&
          word[i - 1].detail === "動詞"
        )
          wordData.word[wordData.length - 1] = "い";

        console.log(wordData);
      } catch (e) {
        console.log(e);
      }
    });

    // if (word[4][word[4].length - 1] === 'わ' && word[5][0] === 'た') word[5] = 'れた';

    // if (word[4][word[4].length - 1] === '寝' && word[5] === 'う') word[5] = 'る';
    // if (word[4][word[4].length - 1] === 'よ' && word[5][0] === 'た') word[5] = 'う';
    // if (word[4].includes('った') && word[5][0] === 'い') word[5][0] = '';
    // if (word[4][word[4].length - 1] === 'わ' && word[5][0] === 'は') word[5] = '';
    // if (word[4][word[4].length - 1] === 'ら' && word[5][0] === 'う') word[5] = 'す';
    // if (word[4].includes('た') && word[5][0] === 'ら') word[5][0] = '';
    // if (word[4][word[4].length - 1] !== 'ま' && word[5][0] === 'う') word[5][0] = 'た';
    // if (word[4][word[4].length - 1] === 'う' && word[5][0] !== 'ぞ') word[5] = '';
    // if (word[4][word[4].length - 1] === 'っ' && word[5][0] === 'だ') word[5] = 'た';
    // if (word[4][word[4].length - 1] === 'っ' && word[5][0] === 'な') word[5] = 'たな';
    // if (word[4][word[4].length - 1] === 'っ' && word[5][0] === 'う') word[5] = 'た';
    // if (word[5][word[5].length - 1] === 'っ') word[5] = word[5] + 'た';
    // if (word[1][word[1].length - 1] === 'に' && word[3][word[1].length - 1] === 'に') word[3] = 'が';
    // if (word[4][word[4].length - 1] === 'る' && word[5][0] === 'た') word[5] = 'ん';
    // if (word[1] === word[3]) word[3] = 'で';
    // if (word[4][word[4].length - 1] === 'う' && word[5][0] === 'た') word[4][word[4].length - 1] = 'っ';
    // if (word[1][word[1].length - 1] === 'て' && word[3][0] === 'を') word[3] = 'で';
    // if (word[4][word[4].length - 1] === 'っ' && word[5][0] === 'ま') word[5] = 'たわ';
    // if (word[5][word[5].length - 1] === 'し') word[5] = 'した';
    // if (word[4][word[4].length - 1] === '寝' && word[5][0] === 'だ') word[5] = 'た';
    // if (word[1][word[1].length - 1] === 'を' && word[3][0] === 'の') {
    //   word[1] = 'の';
    //   word[3] = 'が';
    // }
    // if (word[4][word[4].length - 1] === 'ら' && word[5][0] === 'だ') word[5] = 'せた';
    // if (word[3][word[3].length - 1] === 'の') word[5] = 'が';
    // if (word[4][word[4].length - 1] === 'い' && word[5][0] === 'だ') word[5] = 'た';
    // if (word[4][word[4].length - 1] === 'る' && word[5][0] !== 'な') word[5] = '';
    // if (word[3][word[3].length - 1] === 'が' && word[4][0] === 'て') word[4][0] = 'い';
    // if (word[4][word[4].length - 1] === '寝' && word[5][0] === 'し') word[5] = 'た';
    // if (isIncludes(symbol, word[0])) word[0] = 'わりゅ';
    // if (isIncludes(symbol, word[2])) word[2] = 'Sorakime';
    // if (word[4][word[4].length - 1] === 'え' && word[5][0] !== 'う') word[5] = 'るのか';
    // if (word[3][word[3].length - 1] === 'で' && word[4][0] === '来') word[5] = '着';
    // if (word[3][word[3].length - 1] === 'ぜ') word[5] = 'が';
    // if (word[4][word[4].length - 1] === 'ら' && word[5][0] === 'た') word[5] = 'れた';
    // if (word[4][word[4].length - 1] === 'え' && word[5][0] === 'う') word[5] = 'るん？';

    // let result = template
    //   .replace('1', word[0])  // 名詞
    //   .replace('2', word[1])  // 助詞
    //   .replace('3', word[2])  // 名詞
    //   .replace('4', word[3])  // 助詞
    //   .replace('5', word[4])  // 動詞
    //   .replace('6', word[5]); // 助動詞

    let result = "";
    word.forEach((wordData) => {
      result += wordData.word;
    });

    if (result.match(/@\w+/g)) {
      result.replace(/@\w+/g, "@ rumiasan1218");
    }

    return result;
  },
};
