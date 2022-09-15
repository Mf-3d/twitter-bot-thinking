const twitter = require('twitter-api-v2');

const client = new twitter.TwitterApi({
  appKey: process.env['twitter_consumer_key'],
  appSecret: process.env['twitter_consumer_secret'],
  accessToken: process.env['twitter_access_token_key'],
  accessSecret: process.env['twitter_access_token_secret']
});



async function a () {
  const blockedPaginator = await client.v2.userBlockingUsers('1542826170000977921');
  
  for await (const blockedUser of blockedPaginator) {
    console.log(`You are blocking @${blockedUser.username}.`);
  }
}

a();