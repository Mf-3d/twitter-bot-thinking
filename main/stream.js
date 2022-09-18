const request = require("request");
const twitter = require("twitter-api-v2");
const EventEmitter = require("events");
const emitter = new EventEmitter();
const token = process.env["twitter_bearer_token"];
let client = new twitter.TwitterApi(token);

async function getStream() {
  const rules = await client.v2.streamRules();
  if (rules.data?.length) {
    await client.v2.updateStreamRules({
      delete: { ids: rules.data.map((rule) => rule.id) },
    });
  }

  // Add our rules
  await client.v2.updateStreamRules({
    add: [{ value: "@thinkingService" }],
  });

  const stream = await client.v2.searchStream({
    "tweet.fields": ["referenced_tweets", "author_id"],
    expansions: ["referenced_tweets.id"],
  });
  // Enable auto reconnect
  stream.autoReconnect = true;

  stream.on(twitter.ETwitterStreamEvent.Data, async (tweet) => {
    // Ignore RTs or self-sent tweets
    const isARt =
      tweet.data.referenced_tweets?.some(
        (tweet) => tweet.type === "retweeted"
      ) ?? false;
    if (isARt || tweet.data.author_id === "1542826170000977921") {
      return;
    }

    /** @type {twitter.TweetV2SingleResult} */
    let result = await client.v2.singleTweet(tweet.data.id, {
      expansions: ["author_id"],
      "tweet.fields": "source",
    });

    // Reply to tweet
    emitter.emit("replied", result);
  });
}

getStream();

module.exports = emitter;
