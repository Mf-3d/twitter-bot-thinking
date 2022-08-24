const twitter = require('./main/tweet');
const generate = require('./main/generate');
const emotion = require('./main/emotion');
const fs = require('fs');
const schedule = require('node-schedule');
const express = require('express');
const GithubWebHook = require('express-github-webhook');

const webhookHandler = GithubWebHook({ path: '/webhook', secret: process.env.github_webhook_secret });
const banned_word = require('./banned_word.json');

const isIncludes = (arr, target) => arr.some(el => target.includes(el));

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true })); 
app.use(webhookHandler);

webhookHandler.on('*', function (type, repo, data) {
  if(type !== 'push') return;
  
  data.commits.forEach((commit) => {
    twitter.tweet(`
    "${commit.message}"がコミットされました🤔
    ${commit.url}
    ${new Date().toLocaleString({ timeZone: 'Asia/Tokyo' })}
    `);
  });
});

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

  let timeline = await twitter.getUserTimeline('1421399845743460353');
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
    if(isIncludes(banned_word.banned, tweet_token.surface_form)) return;

    result[result.length] = {
      text: tweet_token.surface_form,
      pos: tweet_token.pos
    }
  });

  tweet_tokens2.forEach(async (tweet_token) => {
    if(result.length >= 7) return;
    if(tweet_token.surface_form.match(/@\w+/g)) return;
    if(isIncludes(banned_word.banned, tweet_token.surface_form)) return;
    result[result.length] = {
      text: tweet_token.surface_form,
      pos: tweet_token.pos
    }
  });


  /** @type {{dict: {text: string}[]}} */
  let file = JSON.parse(fs.readFileSync(`${__dirname}/dictionary.db`));

  let saveData = {
    dict: [
      ...file.dict,
      ...result
    ]
  }

  fs.writeFileSync(`${__dirname}/dictionary.db`, JSON.stringify(saveData));
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
  if(word[4][word[4].length - 1]　 !== 'う' && word[5][0] !== 'ぞ') word[5] = '';
  if(word[4][word[4].length - 1]　 !== 'っ' && word[5][0] !== 'だ') word[5] = 'た';
  if(word[4][word[4].length - 1]　 !== 'っ' && word[5][0] !== 'な') word[5] = 'た';
  if(word[4][word[4].length - 1]　 !== 'っ' && word[5][0] !== 'う') word[5] = 'た';
  if(word[1] === 'が' && word[3] === 'は') {
    word[1] = 'は';
    word[3] = 'で';
  }
  if(word[5][word[5].length - 1] === 'っ') word[5][word[5].length] = 'た';  
  if(word[3][word[3].length - 1] === 'か') word[3] = 'が'; 
  if(word[1][word[1].length - 1] === 'に' && word[3][word[1].length - 1] === 'に') word[3] = 'が'; 
  if(word[5][word[5].length - 1] === 'る' && word[5][0] === 'た') word[5] = 'ん';  
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

  if(isIncludes(banned_word.banned, template)) {
    tweet(replyTweet);
    return;
  }
  
  if(replyTweet) {
    twitter.reply(template, replyTweet);
    twitter.like(replyTweet);
    return;
  }
  twitter.tweet(template);

  
}

function getData(pos = '名詞') {
  /** @type {{text: string, pos: string}[]} */
  let dict = (JSON.parse(fs.readFileSync(`${__dirname}/dictionary.db`))).dict;
  let result = [];

  dict.forEach((word) => {
    if(word.pos !== pos) return;

    result[result.length] = word;
  });

  return result;
}

start();

(function loop() {
  let Rand = Math.round(Math.random() * (18 - 7)) + 7;
  setTimeout(function() {
    learning();
    
    let mode = Math.floor(Math.random() * (60 - 1)) + 1;

    if(mode === 9) {
      twitter.tweet('ツイートを学習しています🤔');
      loop();
      return;
    }

    if(mode === 7) {
      twitter.tweet('🐱');
      loop();
      return;
    }

    if(mode === 1) {
      twitter.tweet('実はこのボット、mf7cliの自由研究のために開発されたんです🤔');
      loop();
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

app.get('/', (req, res) => {
  res.send('Twitter account: @thinkingService');
});

app.listen(3000, () => {
  console.log('Expressサーバーが起動しました');
});