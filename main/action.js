const emotion = require('./emotion');
const fs = require('fs');

module.exports = {
  /** 
  * 好感度を更新
  */
  async updateFavoRate(negaposi, user) {
    // aaaaa
    let userStats = (JSON.parse(fs.readFileSync(`${__dirname}/../users.db`))).users[user];

    if(!userStats) {
      userStats = {
        id: user,
        interested: [],
        recentNegaposi: [negaposi],
        favoRate: negaposi,
        last_seen: new Date()
      }
    }

    fs.writeFileSync(`${__dirname}/../users.db`, JSON.stringify(userStats, null, "\t"));
  }
}