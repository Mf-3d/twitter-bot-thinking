const emotion = require('./emotion');
const fs = require('fs');

module.exports = {
  /** 
  * 好感度を更新
  * @param {number} negaposi
  * @param {string} user
  */
  async updateFavoRate(negaposi, user) {
    // aaaaa
    let users = (JSON.parse(fs.readFileSync(`${__dirname}/../users.db`)));

    if(!users.users[user]) {
      users.users[user] = {
        id: user,
        interested: [],
        recentNegaposi: [],
        favoRate: negaposi,
        last_seen: new Date()
      }
    }

    if( users.users[user].recentNegaposi.length > 10) users.users[user].recentNegaposi = [];
    users.users[user].recentNegaposi[users.users[user].recentNegaposi.length] = negaposi;

    let favoRate = users.users[user].recentNegaposi.reduce((sum, element) => {
      return sum + element;
    }, 0);


    users.users[user].favoRate = (Math.round(favoRate * 100) / 100) / users.users[user].recentNegaposi.length;
    users.users[user].last_seen = new Date();
    fs.writeFileSync(`${__dirname}/../users.db`, JSON.stringify(users, null, "\t"));
  },
  
  /** 
  * 好感度を取得
  * @param {string} user
  * @return {Promise<number>}
  */
  async getFavoRate(user) {
    let users = (JSON.parse(fs.readFileSync(`${__dirname}/../users.db`)));
    if(!users.users[user]) users.users[user].favoRate = 0;
    
    return users.users[user].favoRate;
  }
}