const Twit = require('twit');
const dotenv = require('dotenv');
const SentimentModule = require('sentiment');
const colors = require('colors/safe');

dotenv.config();

const {
  CONSUMER_KEY,
  CONSUMER_SECRET,
  ACCESS_TOKEN,
  ACCESS_TOKEN_SECRET,
} = process.env;

class TwitterSentimentAnalysis {

  constructor(config) {
    this.api = new Twit(config);
    this.sentiment = new SentimentModule();
  }

  getText(tweet) {
    const txt = tweet.retweeted_status ? tweet.retweeted_status.full_text : tweet.full_text;
    return txt.split(/ |\n/).filter(v => !v.startsWith('http')).join(' ');
  }

  async getTweets(q, count) {
    const tweets = await this.api.get('search/tweets', {
      q,
      count,
      'tweet_mode': 'extended'
    });
    return tweets.data.statuses.map(this.getText);
  }

  async run(keyword, count) {
    const tweets = await this.getTweets(keyword, count);
    for (let tweet of tweets) {
      let score = this.sentiment.analyze(tweet).comparative;
      tweet = `${tweet}\n`;
      if (score > 0) {
        tweet = colors.green(tweet);
      } else if (score < 0) {
        tweet = colors.red(tweet);
      } else {
        tweet = colors.blue(tweet);
      }
      console.log(tweet);
    }
  }
}

new TwitterSentimentAnalysis({
  consumer_key: CONSUMER_KEY,
  consumer_secret: CONSUMER_SECRET,
  access_token: ACCESS_TOKEN,
  access_token_secret: ACCESS_TOKEN_SECRET,
  timeout_ms: 60*1000,
}).run('worldcup', 100);