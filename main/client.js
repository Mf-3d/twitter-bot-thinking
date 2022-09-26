const generate = require("./generate");
const banned_word = require("../banned_word.json");
const isIncludes = (arr, target) => arr.some((el) => target.includes(el));

module.exports = {
  TwitterClient: class {
    constructor(timeline) {
      this.timeline = timeline;
    }
    async get() {
      const target = Math.floor(
        Math.random() * (this.timeline.length - 1 - 0) + 0
      );
  
      this.tweet_tokens = await generate.tokenize(this.timeline[target].text);
    }
    learn() {
      let result;
      this.tweet_tokens.forEach(async (tweet_token) => {
        if (this.tweet_tokens.length >= 7) return;
        if (tweet_token.surface_form.length - 1 >= 10) return;
        if (tweet_token.surface_form.match(/@\w+/g)) return;
        if (isIncludes(banned_word.banned, tweet_token.surface_form)) return;
  
        result = {
          text: tweet_token.surface_form,
          pos: tweet_token.pos,
        };
      });

      return result;
    }
  }
}
