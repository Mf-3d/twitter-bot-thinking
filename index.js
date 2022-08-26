const twitter = require('./main/tweet');
const generate = require('./main/generate');
const emotion = require('./main/emotion');
const fs = require('fs');
const schedule = require('node-schedule');
const express = require('express');
const { Webhook } = require('discord-webhook-node');
const GithubWebHook = require('express-github-webhook');

const hook = new Webhook(process.env.discord_webhook);

hook.setUsername('thinking Bot（仮）のTwitter通知');
hook.setAvatar('https://pbs.twimg.com/profile_images/1561649021084913664/1CZezFH3_400x400.jpg');

const webhookHandler = GithubWebHook({ path: '/webhook', secret: process.env.github_webhook_secret });
const banned_word = require('./banned_word.json');

const isIncludes = (arr, target) => arr.some(el => target.includes(el));

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(webhookHandler);

webhookHandler.on('*', function(type, repo, data) {
  if (type !== 'push') return;
  let date = new Date(Date.now() + ((new Date().getTimezoneOffset() + (9 * 60)) * 60 * 1000));
  let dateString = date.getFullYear()
    + '/' + ('0' + (date.getMonth() + 1)).slice(-2)
    + '/' + ('0' + date.getDate()).slice(-2)
    + ' ' + ('0' + date.getHours()).slice(-2)
    + ':' + ('0' + date.getMinutes()).slice(-2)
    + ':' + ('0' + date.getSeconds()).slice(-2)
  data.commits.forEach((commit) => {
    twitter.tweet(`
    "${commit.message}"がコミットされました🤔\n${dateString}
    ${commit.url}
    `);
  });
});

async function start() {
  console.log('サーバーが起動しました');
  hook.send("鯖が起動したぞ");
  // const tokenArr = (await generate.tokenize('私は定期的にツイートを学習します。')).map((token)=>{
  //   return token.surface_form
  // });
  // console.log(tokenArr);

  // twitter.updateBio(`
  // Artificial incompetence to thinking.

  // ※このBotがツイートすることはほぼすべて自動生成です
  // `);
  setTimeout(() => {
    tweet();
  }, 3000);
}

async function learning() {
  /** @type {{text: string}[]} */let result = [];

  let timeline = await twitter.getUserTimeline('1367151006824296451');
  // let timeline = await twitter.getTimeline();
  /** @type {import('twitter-api-v2').TweetV2[]} */let filtered_timeline = [];

  timeline.forEach(tweet => {
    if (tweet.text.slice(0, 3) === 'RT ') return;

    filtered_timeline[filtered_timeline.length] = tweet;
  });

  let target = Math.floor(Math.random() * ((filtered_timeline.length - 1) - 0) + 0);
  let target2 = Math.floor(Math.random() * ((filtered_timeline.length - 1) - 0) + 0);

  let tweet_tokens = await generate.tokenize(filtered_timeline[target].text);
  let tweet_tokens2 = await generate.tokenize(filtered_timeline[target2].text);


  tweet_tokens.forEach(async (tweet_token) => {
    if (result.length >= 7) return;
    if (tweet_token.surface_form.match(/@\w+/g)) return;
    if (isIncludes(banned_word.banned, tweet_token.surface_form)) return;

    result[result.length] = {
      text: tweet_token.surface_form,
      pos: tweet_token.pos
    }
  });

  tweet_tokens2.forEach(async (tweet_token) => {
    if (result.length >= 7) return;
    if (tweet_token.surface_form.match(/@\w+/g)) return;
    if (isIncludes(banned_word.banned, tweet_token.surface_form)) return;

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

async function tweet(replyTweet) {
  let useTemplateId = Math.floor(Math.random() * (9 - 0) + 0);
  let noun = getData('名詞');
  let verb = getData('動詞');
  let particle = getData('助詞');
  let auxiliary_verb = getData('助動詞');

  // template
  let target = Math.floor(Math.random() * ((noun.length - 1) - 0) + 0);
  let target2 = Math.floor(Math.random() * ((particle.length - 1) - 0) + 0);
  let target3 = Math.floor(Math.random() * ((noun.length - 1) - 0) + 0);
  let target4 = Math.floor(Math.random() * ((verb.length - 1) - 0) + 0);
  let target5 = Math.floor(Math.random() * ((auxiliary_verb.length - 1) - 0) + 0);
  let target6 = Math.floor(Math.random() * ((auxiliary_verb.length - 1) - 0) + 0);

  // template
  /** @type {string[]} */
  let word = [noun[target].text, particle[target2].text, noun[target3].text, particle[target6].text, verb[target4].text, auxiliary_verb[target5].text];

  let template;
  if (useTemplateId === 1) {
    template = await generate.connect(word, `
    1は2🤯
    ※ボットのテストです
    `);
  } else if (useTemplateId === 2) {
    template = await generate.connect(word, `
    123456🤔
    ※ボットのテストです
    `);
  } else if (useTemplateId === 3) {
    template = await generate.connect(word, `
    1ってなんだ🤔？
    ※ボットのテストです
    `);
  } else {
    template = await generate.connect(word, `
    123456🤔
    ※ボットのテストです
    `);
  }

  if (isIncludes(banned_word.banned, template)) {
    tweet(replyTweet);
    return;
  }

  hook.send(`\`\`\`${template}\`\`\`をツイートします🤔`);

  if (replyTweet) {
    twitter.reply(template, replyTweet);
    
    return;
  }
  twitter.tweet(template);
}

function getData(pos = '名詞') {
  /** @type {{text: string, pos: string}[]} */
  let dict = (JSON.parse(fs.readFileSync(`${__dirname}/dictionary.db`))).dict;
  let result = [];

  dict.forEach((word) => {
    if (word.pos !== pos) return;

    result[result.length] = word;
  });

  return result;
}

start();

(function loop() {
  let Rand = Math.round(Math.random() * (18 - 7)) + 7;
  setTimeout(function() {
    let mode = Math.floor(Math.random() * (60 - 1)) + 1;

    if (mode === 9) {
      twitter.tweet('ツイートを学習しています🤔');
      loop();
      return;
    }

    if (mode === 7) {
      twitter.tweet('🐱');
      loop();
      return;
    }

    tweet();
    loop();
  }, Rand * 60000);
})();

(function loop2() {
  setTimeout(function() {
    learning();
    loop2();

    // const usersPaginated = await client.v2.tweetLikedBy('20', { asPaginator: true });

    // for await (const user of usersPaginated) {
    //   console.log(user.id);
    // }
  }, 0.25 * 60 * 60000);
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

twitter.event.on('replied', async (reply) => {
  twitter.like(reply.data.id);
  console.log('リプされました', reply.data.id);

  if (reply.data.text.includes('waryu')) {
    let word = ['w', 'a', 'r', 'y', 'u'];
    let rnd = [
      Math.floor(Math.random() * ((word.length - 1) - 1)) + 1,
      Math.floor(Math.random() * ((word.length - 1) - 1)) + 1,
      Math.floor(Math.random() * ((word.length - 1) - 1)) + 1,
      Math.floor(Math.random() * ((word.length - 1) - 1)) + 1,
      Math.floor(Math.random() * ((word.length - 1) - 1)) + 1
    ];

    let waryu = `${word[rnd[0]]}${word[rnd[1]]}${word[rnd[2]]}${word[rnd[3]]}${word[rnd[4]]}`

    twitter.like(reply.data.id);
    twitter.reply(waryu, reply.data.id);
    return;
  }


  let negaposi = await emotion.analysis(await generate.tokenize(reply.data.text));

  if (negaposi <= -0.01) {
    twitter.reply('...🤔', reply.data.id);
    return;
  }

  console.log(negaposi);
  tweet(reply.data.id);
});

app.get('/', (req, res) => {
  res.send('Twitter account: @thinkingService');
});

app.listen(3000, () => {
  console.log('Expressサーバーが起動しました');
});