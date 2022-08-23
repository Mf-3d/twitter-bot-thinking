const twitter = require('./main/tweet');
const generate = require('./main/generate');
const emotion = require('./main/emotion');
const fs = require('fs');
const schedule = require('node-schedule');

async function start() {
  console.log('サーバーが起動しました');

  // const tokenArr = (await generate.tokenize('私は定期的にツイートを学習します。')).map((token)=>{
  //   return token.surface_form
  // });
  // console.log(tokenArr);

  setTimeout(() => {
    learning();
    tweet();
  }, 3000);
}

async function learning() {
  /** @type {{text: string}[]} */let result = [];

  let timeline = await twitter.getUserTimeline('1421303312796639232');
  // let timeline = await twitter.getTimeline();
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

function tweet(replyTweet) {
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
  if(word[4][word[4].length - 1] === 'わ' && word[5][0] === 'は') word[5] = '';
  if(word[4][word[4].length - 1] === 'ら' && word[5][0] === 'う') word[5] = 'す';
  if(word[1][word[1].length - 1] === 'の' && word[3][0] === 'の') word[3] = 'を';
  if(word[4].includes('た') && word[5][0] === 'ら') word[5][0] = '';
  
  let template = `
  123456🤔
  ※ボットのテストです
  `;

  template = template
  .replace('1', word[0]) // 名詞
  .replace('2', word[1]) // 助詞
  .replace('3', word[2]) // 名詞
  .replace('4', word[3]) // 助詞
  .replace('5', word[4]) // 動詞
  .replace('6', word[5]); // 助動詞

  if(replyTweet) {
    twitter.reply(template, replyTweet);
    return;
  }
  twitter.tweet(template);
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

(function loop() {
  let Rand = Math.round(Math.random() * (10 - 1)) + 1;
  setTimeout(function() {
    learning();
    
    let mode = Math.floor(Math.random() * (10 - 1)) + 1;

    if(mode === 10) {
      twitter.tweet('ツイートを学習しています🤔');
      return;
    }
    tweet();
    loop();
  }, Rand * 60000);
})();

const job1 = schedule.scheduleJob('0 0 21 * * *', () => {
  twitter.tweet('おはよう🤔')
});

const job2 = schedule.scheduleJob('0 0 3 * * *', () => {
  twitter.tweet('12時🤔');
});

const job3 = schedule.scheduleJob('0 34 18 * * *', () => {
  twitter.tweet('33-4🤯');
});

twitter.event.on('replied', (reply) => {
  console.log('リプされました', reply.data.id);
  
  tweet(reply.data.id);
});