// TODO classを使って同じインスタンスを生成してコードの短縮をする

const client = require("./client");
const twitter = require("./tweet");
const fs = require("fs");

module.exports = {
  async learnTokens() {
    /** @type {{text: string, pos: string}[]} */ let result = [];

    let timeline = await twitter.getUserTimeline("1441436363304300553");
    // let timeline = await twitter.getTimeline();
    /** @type {import('twitter-api-v2').TweetV2[]} */ let filtered_timeline =
      [];

    timeline.forEach((tweet) => {
      if (tweet.text.slice(0, 3) === "RT ") return;

      filtered_timeline[filtered_timeline.length] = tweet;
    });

    const Client = new client.TwitterClient(filtered_timeline);

    for (let i = 0; i < 2; i++) {
      await Client.get();
      let r = Client.learn();

      if (!r) return;
      result[result.length] = r;
    }

    /** @type {{dict: {text: string}[]}} */
    let file = JSON.parse(fs.readFileSync(`${__dirname}/../dictionary.db`));

    let saveData = {
      dict: [...file.dict, ...result],
    };

    fs.writeFileSync(
      `${__dirname}/../dictionary.db`,
      JSON.stringify(saveData, null, "\t")
    );
  },

  addGroupOfParts: (groupName, part) => {
    /** @type {
       {
         group: {
           name: string;
           similar: string[]
         }[]
       }
     } 
    */
    let file = JSON.parse(fs.readFileSync(`${__dirname}/../groupOfParts.db`));

    file.group.forEach(group => {
      if (!group || typeof group !== "object") return;
      
      if (group.name === groupName) {
        group.similar[group.similar.length] = part;
      }
    });

    fs.writeFileSync(
      `${__dirname}/../groupOfParts.db`,
      JSON.stringify(file, null, "\t")
    );
  },

  addReplyPattern: (text, replyText) => {
    /** @type {
       {
         pattern: {
           text: string;
           replyText: string;
         }[]
       }
     } 
    */
    let file = JSON.parse(fs.readFileSync(`${__dirname}/../replys.db`));

    file.pattern[file.pattern.length] = {
      text,
      replyText
    }

    fs.writeFileSync(
      `${__dirname}/../groupOfParts.db`,
      JSON.stringify(file, null, "\t")
    );
  }
}
