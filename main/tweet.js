const twitter = require('twitter-api-v2');
require('dotenv').config();

const client = new twitter.TwitterApi({
  appKey: process.env.consumer_key,
  appSecret: process.env.consumer_secret,
  accessToken: process.env.access_token_key,
  accessSecret: process.env.access_token_secret
})

module.exports = {
  /**
   * Post tweet.
   * @param {string} text 
   * @return {Promise<twitter.TweetV2PostTweetResult>} Tweet data
   */
  async tweet(text) {
    return await client.v2.tweet(text);
  },

  async getTimeline() {
    let timeLine = await client.v2.homeTimeline(
      {
        exclude: 'replies'
      }
    );

    return timeLine.tweets;
  },

  async getUserTimeline(user) {
    let timeLine = await client.v2.userTimeline(user, {
      exclude: 'replies',
      max_results: 30
    });

    return timeLine.tweets;
  },

  /**
   * 
   * @param {string} tweetId 
   * @return {Promise<twitter.TweetV2SingleResult>}
   */
  async getTweet(tweetId) {
    return await client.v2.singleTweet(tweetId, {
      expansions: [
        'author_id'
      ]
    });
  }
}