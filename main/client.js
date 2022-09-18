const generate = require("./generate");
const banned_word = require("../banned_word.json");
const isIncludes = (arr, target) => arr.some((el) => target.includes(el));

export class TwitterClient {
  constructor(timeline) {
    this.timeline = timeline;
  }
  async get() {
    const target = Math.floor(
      Math.random() * (filtered_timeline.length - 1 - 0) + 0
    );

    this.tweet_tokens = await generate.tokenize(timeline[target].text);
  }
  learn(data) {
    this.tweet_tokens.forEach(async (tweet_token) => {
      if (data.length >= 7) return;
      if (tweet_token.surface_form.length - 1 >= 10) return;
      if (tweet_token.surface_form.match(/@\w+/g)) return;
      if (isIncludes(banned_word.banned, tweet_token.surface_form)) return;

      return {
        text: tweet_token.surface_form,
        pos: tweet_token.pos,
      };
    });
  }
}
