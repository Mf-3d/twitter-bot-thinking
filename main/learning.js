const twitter = require('./tweet');
const generate = require('./generate');
const banned_word = require('../banned_word.json');
const isIncludes = (arr, target) => arr.some(el => target.includes(el));
const fs = require('fs');

module.exports = {
  async learnTokens() {
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
    let file = JSON.parse(fs.readFileSync(`${__dirname}/../dictionary.db`));
  
    let saveData = {
      dict: [
        ...file.dict,
        ...result
      ]
    }
  
    fs.writeFileSync(`${__dirname}/../dictionary.db`, JSON.stringify(saveData));
  },

  async learnTemplates() {
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
  
      result[result.length] = tweet_token.pos;
    });
  
  
    /** @type {{template: [{pos: string}[]][]}} */
    let file = JSON.parse(fs.readFileSync(`${__dirname}/../template.db`));
  
    let saveData = {
      template: [
        ...file.template,
        result
      ]
    }
  
    fs.writeFileSync(`${__dirname}/../template.db`, JSON.stringify(saveData));
  }
}