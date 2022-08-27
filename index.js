const twitter = require('./main/tweet');
const generate = require('./main/generate');
const emotion = require('./main/emotion');
const learn = require('./main/learning');
const fs = require('fs');
const schedule = require('node-schedule');
const express = require('express');
const { Webhook } = require('discord-webhook-node');
const GithubWebHook = require('express-github-webhook');

// const hook = new Webhook(process.env.discord_webhook);

// hook.setUsername('thinking Bot（仮）のTwitter通知');
// hook.setAvatar('https://pbs.twimg.com/profile_images/1561649021084913664/1CZezFH3_400x400.jpg');

const webhookHandler = GithubWebHook({ path: '/webhook', secret: process.env.github_webhook_secret });
const banned_word = require('./banned_word.json');

const isIncludes = (arr, target) => arr.some(el => target.includes(el));

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(webhookHandler);

webhookHandler.on('*', function(type, repo, data) {
  // if (type !== 'push') return;
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

  console.log(data, type);
});

async function start() {
  // hook.send("鯖が起動したぞ");
  // const tokenArr = (await generate.tokenize('私は定期的にツイートを学習します。')).map((token)=>{
  //   return token.surface_form
  // });
  // console.log(tokenArr);

  // twitter.tweet('@nyanpassnanon どわ😟？')
  // twitter.updateBio(`
  // Artificial incompetence to thinking.

  // ※このBotがツイートすることはほぼすべて自動生成です
  // `);
  tweet();
}

async function learning() {
  learn.learnTokens();
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

  let template = await generate.connect();

  if (isIncludes(banned_word.banned, template)) {
    tweet(replyTweet);
    return;
  }

  // hook.send(`\`\`\`${template}\`\`\`をツイートします🤔`);

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

(function loop() {
  let Rand = Math.round(Math.random() * (18 - 7)) + 7;
  setTimeout(function() {
    let now = new Date();
    if(now.getHours() >= 14 && now.getHours() < 21) return;
    
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
  }, 5 * 60000);
})();

const job1 = schedule.scheduleJob('0 0 21 * * *', () => {
  twitter.tweet('おはよう🤔');
});

const job2 = schedule.scheduleJob('0 0 14 * * *', () => {
  twitter.tweet('おやすみ🥱');
});

const job3 = schedule.scheduleJob('0 0 3 * * *', () => {
  twitter.tweet('12時🤔');
});

const job4 = schedule.scheduleJob('0 34 18 * * *', () => {
  twitter.tweet('33-4🤯');
});



twitter.event.on('replied', async (reply) => {
  twitter.like(reply.data.id);
  console.log('リプされました', reply.data.id);
  let replyChance = undefined;
  console.log(reply.data.source);
  if (!isIncludes(['for iPad', 'for Android', 'for Mac', 'for iPhone', 'Twitter Web App'], reply.data.source)) {
    console.log('このリプはbotのリプの可能性があります\n対botモードで対応します');
    replyChance = Math.random() * (1 - -1) + -1;

    if(replyChance <= 0) return;
  }

  
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

    twitter.reply(waryu, reply.data.id);
    return;
  }

  if (reply.data.text.toLowerCase().includes(JSON.parse(process.env.REPLY_SECRET_WORD).query)) {
    twitter.reply(JSON.parse(process.env.REPLY_SECRET_WORD).value, reply.data.id);
    return;
  }


  let negaposi = await emotion.analysis(await generate.tokenize(reply.data.text));

  if (negaposi < 0 && negaposi > -0.05) {
    twitter.reply('...🤔', reply.data.id);
    return;
  }

  if (negaposi <= -0.05 && negaposi > -0.1) {
    twitter.reply('ほう...😔', reply.data.id);
    return;
  }

  if (negaposi > 0 && negaposi <= 0.05) {
    twitter.reply('お㍂🤔', reply.data.id);
    return;
  }
  
  if (negaposi > 0.05) {
    twitter.reply('おぉ🤯', reply.data.id);
    return;
  }

  tweet(reply.data.id);
});

app.get('/', (req, res) => {
  res.send('Twitter account: @thinkingService');
});

app.listen(3000, () => {
  console.log('サーバーが起動しました');

  start();
});