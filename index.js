const twitter = require("./main/tweet");
const generate = require("./main/generate");
const emotion = require("./main/emotion");
const learn = require("./main/learning");
const action = require("./main/action");
const fs = require("fs");
const schedule = require("node-schedule");
const express = require("express");
const { Webhook } = require("discord-webhook-node");
const GithubWebHook = require("express-github-webhook");

// const hook = new Webhook(process.env.discord_webhook);

// hook.setUsername('thinking Bot（仮）のTwitter通知');
// hook.setAvatar('https://pbs.twimg.com/profile_images/1561649021084913664/1CZezFH3_400x400.jpg');

const webhookHandler = GithubWebHook({
  path: "/webhook",
  secret: process.env.github_webhook_secret,
});
const banned_word = require("./banned_word.json");

const isIncludes = (arr, target) => arr.some((el) => target.includes(el));

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(webhookHandler);

webhookHandler.on("*", function (type, repo, data) {
  if (type !== "push") return;
  let date = new Date(
    Date.now() + (new Date().getTimezoneOffset() + 9 * 60) * 60 * 1000
  );
  let dateString =
    date.getFullYear() +
    "/" +
    ("0" + (date.getMonth() + 1)).slice(-2) +
    "/" +
    ("0" + date.getDate()).slice(-2) +
    " " +
    ("0" + date.getHours()).slice(-2) +
    ":" +
    ("0" + date.getMinutes()).slice(-2) +
    ":" +
    ("0" + date.getSeconds()).slice(-2);

  twitter.tweet(`
  "${data.head_commit.message}"がコミットされました🤔\n${dateString}
  ${data.head_commit.url}
  `);

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

  replyCheck();
}

async function learning() {
  learn.learnTokens();
  // learn.learnTemplates();
}

async function tweet(replyTweet) {
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

function getData(pos = "名詞") {
  /** @type {{text: string, pos: string}[]} */
  let dict = JSON.parse(fs.readFileSync(`${__dirname}/dictionary.db`)).dict;
  let result = [];

  dict.forEach((word) => {
    if (word.pos !== pos) return;

    result[result.length] = word;
  });

  return result;
}

(function loop() {
  let Rand = Math.round(Math.random() * (18 - 7)) + 7;

  setTimeout(async function () {
    let now = new Date();
    if (now.getHours() >= 14 && now.getHours() < 21) return;

    let mode = Math.floor(Math.random() * (60 - 1)) + 1;

    if (mode === 9) {
      twitter.tweet("ツイートを学習しています🤔");
      loop();
      return;
    }

    if (mode === 7) {
      twitter.tweet("🐱");
      loop();
      return;
    }

    tweet();
    loop();
  }, Rand * 60000);
})();

(function loop2() {
  setTimeout(function () {
    learning();
    loop2();

    // const usersPaginated = await client.v2.tweetLikedBy('20', { asPaginator: true });

    // for await (const user of usersPaginated) {
    //   console.log(user.id);
    // }
  }, 5 * 60000);
})();

(function loop3() {
  let Rand = Math.round(Math.random() * (1 - 0.2)) + 0.2;
  setTimeout(async function () {
    replyCheck();
    loop3();
  }, Rand * 60000);
})();

async function replyCheck() {
  let queues = await action.getQueue();

  if (queues.queues.length > 0) {
    await action.deleteQueue(0);
    await replyTweet(queues.queues[0].data.reply);

    if (queues.queues.length === 1) return;

    queues.queues.forEach(async (queue, queueNumber) => {
      if (queueNumber === 0) return;
      let Rand2 = Math.round(Math.random() * (0.4 - 0.2)) + 0.2;
      setTimeout(async function () {
        await action.deleteQueue(queueNumber);
        await replyTweet(queue.data.reply);
      }, Rand2 * 60000);
    });
  }
}

const job1 = schedule.scheduleJob("0 0 21 * * *", () => {
  twitter.tweet("おはよう🤔");
});

const job2 = schedule.scheduleJob("0 0 14 * * *", () => {
  twitter.tweet("おやすみ🥱");
});

const job3 = schedule.scheduleJob("0 0 3 * * *", () => {
  twitter.tweet("12時🤔");
});

const job4 = schedule.scheduleJob("0 34 18 * * *", () => {
  twitter.tweet("33-4🤯");
});

async function replyTweet(reply) {
  let favoRate = await action.getFavoRate(reply.data.author_id);

  // let isQuestion = await action.isQuestions(reply.data.text);

  let replyChance = undefined;
  console.log(reply.data.source);

  if (
    !isIncludes(
      [
        "Twitter for iPad",
        "Twitter for Android",
        "Twitter for Mac",
        "Twitter for iPhone",
        "Twitter Web App",
      ],
      reply.data.source
    )
  ) {
    console.log(
      "このリプはbotのリプの可能性があります\n対botモードで対応します"
    );
    replyChance = Math.random() * (1 - -1) + -1;

    if (replyChance <= 0) return;
  }

  if (reply.data.text.includes("$ learn part")) {
    if (reply.data.author_id !== "1450976364429864963") return;

    const params = reply.data.text.slice(reply.data.text.indexOf("$ learn part") + 13);

    learn.addGroupOfParts(params.split(",")[0], params.split(",")[1]);
    
    twitter.reply(`
    【パーツ学習😟】
    パーツグループ: ${params.split(",")[0]}
    パーツ: ${params.split(",")[1]}
    
    学習しました。`, reply.data.id);
    return;
  }

  // if (reply.data.text.includes('waryu')) {
  //   let word = ['w', 'a', 'r', 'y', 'u'];
  //   let rnd = [
  //     Math.floor(Math.random() * ((word.length - 1) - 1)) + 1,
  //     Math.floor(Math.random() * ((word.length - 1) - 1)) + 1,
  //     Math.floor(Math.random() * ((word.length - 1) - 1)) + 1,
  //     Math.floor(Math.random() * ((word.length - 1) - 1)) + 1,
  //     Math.floor(Math.random() * ((word.length - 1) - 1)) + 1
  //   ];

  //   let waryu = `${word[rnd[0]]}${word[rnd[1]]}${word[rnd[2]]}${word[rnd[3]]}${word[rnd[4]]}`

  //   twitter.reply(waryu, reply.data.id);
  //   return;
  // }

  let isQuestion = await action.isQuestions(reply.data.text);
  let negaposi = await emotion.analysis(
    await generate.tokenize(reply.data.text)
  );

  console.log(await generate.tokenize(reply.data.text));
  console.log('質問かどうか:', isQuestion);
  
  negaposi += 0.02;
  console.log("ネガポジ値を取得しました");
  await action.updateFavoRate(negaposi, reply.data.author_id);

  // if (isQuestion >= 0.01) {
  //   twitter.reply('疑問文には答えられん、、😔', reply.data.id)
  //   return;
  // }

  if (favoRate < 0) negaposi -= favoRate / 2;
  if (favoRate > 0) negaposi += favoRate;

  if (isQuestion > 0.07) {
    twitter.reply(await action.getQuestionReply(reply.data.text), reply.data.id);
    return;
  }
  
  if (
    negaposi < 0 &&
    negaposi > -0.05 &&
    Math.round(Math.random() * (0 - 1) + 1) === 1
  ) {
    twitter.reply("...🤔", reply.data.id);
    return;
  }

  if (
    negaposi <= -0.05 &&
    negaposi > -0.1 &&
    Math.round(Math.random() * (0 - 1) + 1) === 1
  ) {
    twitter.reply("ほう...😔", reply.data.id);
    return;
  }

  if (
    negaposi > 0.02 &&
    negaposi <= 0.05 &&
    Math.round(Math.random() * (0 - 1) + 1) === 1
  ) {
    twitter.reply("お㍂🤔", reply.data.id);
    return;
  }

  if (negaposi > 0.05 && Math.round(Math.random() * (0 - 1) + 1) === 1) {
    twitter.reply("🤯", reply.data.id);
    return;
  }

  tweet(reply.data.id);
}

twitter.event.on("replied", async (reply) => {
  twitter.like(reply.data.id);

  await action.saveQueue("reply", {
    reply,
  });
  console.log("リプされました", reply.data.id);
});

app.get("/", (req, res) => {
  res.send("Twitter account: @thinkingService");
});

app.listen(3000, () => {
  console.log("サーバーが起動しました");

  start();
});
