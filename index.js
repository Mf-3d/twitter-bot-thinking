const twitter = require('./main/tweet');
const generate = require('./main/generate');
const emotion = require('./main/emotion');
const fs = require('fs');

async function start() {
  console.log('サーバーが起動しました');

  // const tokenArr = (await generate.tokenize('私は定期的にツイートを学習します。')).map((token)=>{
  //   return token.surface_form
  // });
  // console.log(tokenArr);
}

async function learning() {
  /** @type {{text: string}[]} */let result = [];

  let timeline = await twitter.getUserTimeline('1033535983189254145');
  /** @type {import('twitter-api-v2').TweetV2[]} */let filtered_timeline = [];

  timeline.forEach(tweet => {
    if(tweet.text.slice(0, 3) === 'RT ') return;

    filtered_timeline[filtered_timeline.length] = tweet;
  });

  let target = Math.floor(Math.random() * ((filtered_timeline.length - 1) - 0) + 0); 
  let target2 = Math.floor(Math.random() * ((filtered_timeline.length - 1) - 0) + 0); 

  let tweet_tokens = await generate.tokenize(filtered_timeline[target].text);
  let tweet_tokens2 = await generate.tokenize(filtered_timeline[target2].text);

  tweet_tokens.forEach(async (tweet_token) => {
    if(result.length >= 7) return;
    if(tweet_token.surface_form.match(/@\w+/g)) return;

    result[result.length] = {
      text: tweet_token.surface_form,
      pos: tweet_token.pos
    }
  });

  tweet_tokens2.forEach(async (tweet_token) => {
    if(result.length >= 7) return;
    if(tweet_token.surface_form.match(/@\w+/g)) return;

    result[result.length] = {
      text: tweet_token.surface_form,
      pos: tweet_token.pos
    }
  });


  /** @type {{dict: {text: string}[]}} */
  let file = JSON.parse(fs.readFileSync(`${__dirname}/dictonary.db`));

  let saveData = {
    dict: [
      ...file.dict,
      ...result
    ]
  }

  fs.writeFileSync(`${__dirname}/dictonary.db`, JSON.stringify(saveData));
}

function tweet() {
  let noun = getData('名詞');
  let verb = getData('動詞');
  let particle = getData('助詞');
  let auxiliary_verb = getData('助動詞');
  let target = Math.floor(Math.random() * ((noun.length - 1) - 0) + 0); 
  let target2 = Math.floor(Math.random() * ((particle.length - 1) - 0) + 0); 
  let target3 = Math.floor(Math.random() * ((noun.length - 1) - 0) + 0); 
  let target4 = Math.floor(Math.random() * ((verb.length - 1) - 0) + 0);
  let target5 = Math.floor(Math.random() * ((auxiliary_verb.length - 1) - 0) + 0);
  let target6 = Math.floor(Math.random() * ((auxiliary_verb.length - 1) - 0) + 0);
  
  /** @type {string[]} */
  let word = [noun[target].text, particle[target2].text, noun[target3].text, particle[target6].text, verb[target4].text, auxiliary_verb[target5].text];
  
  if(word[3] === 'て') word[3] = 'が';
  if(word[4][word[4].length - 1] === 'よ' && word[5][0] === 'た') word[5] = 'か';
  if(word[4][word[4].length - 1] !== 'だ' && word[5] === 'しな') word[4] = 'だ';
  if(word[4][word[4].length - 1] !== 'る' && word[5][0] === 'た') word[5][0] = 'か';
  if(word[4][word[4].length - 1] === 'よ' && word[5][0] === 'ま') word[5][0] = 'で';
  if(word[1] === 'て' && word[3] === 'から') word[1] === 'が';
  if(word[4][word[4].length - 1] === 'わ' && word[5].indexOf('れた') === -1) word[5] = 'れた';
  if(word[1][word[1].length - 1] === 'て' && word[3][0] === 'に') word[5] = 'は';
  if(word[4][word[4].length - 1] === '寝' && word[5] === 'う') word[5] = 'る';
  if(word[4][word[4].length - 1] === 'よ' && word[5][0] === 'た') word[5] = 'う';
  if(word[4].includes('った') && word[5][0] === 'い') word[5][0] = '';

  let template = `
  123456（？）
  ※ボットのテストです
  `;

  template = template
  .replace('1', word[0]) // 名詞
  .replace('2', word[1]) // 助詞
  .replace('3', word[2]) // 名詞
  .replace('4', word[3]) // 助詞
  .replace('5', word[4]) // 動詞
  .replace('6', word[5]); // 助動詞

  console.log(template);
  // twitter.tweet(template);
}

function getData(pos = '名詞') {
  /** @type {{text: string, pos: string}[]} */
  let dict = (JSON.parse(fs.readFileSync(`${__dirname}/dictonary.db`))).dict;
  let result = [];

  dict.forEach((word) => {
    if(word.pos !== pos) return;

    result[result.length] = word;
  });

  return result;
}

start();

// learning();
tweet();
// setInterval(() => {
//   learning();
//   tweet();
// }, 5 * 60000);