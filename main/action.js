const fs = require("fs");
const { removeBackgroundFromImageUrl } = require("remove.bg");

module.exports = {
  /**
   * 好感度を更新
   * @param {number} negaposi
   * @param {string} user
   */
  async updateFavoRate(negaposi, user) {
    // aaaaa
    let users = JSON.parse(fs.readFileSync(`${__dirname}/../users.db`));

    if (!users.users[user]) {
      users.users[user] = {
        id: user,
        interested: [],
        recentNegaposi: [],
        favoRate: negaposi,
        last_seen: new Date(),
      };
    }

    if (users.users[user].recentNegaposi.length > 10)
      users.users[user].recentNegaposi = [];
    users.users[user].recentNegaposi[users.users[user].recentNegaposi.length] =
      negaposi;

    let favoRate = users.users[user].recentNegaposi.reduce((sum, element) => {
      return sum + element;
    }, 0);

    users.users[user].favoRate =
      Math.round(favoRate * 100) /
      100 /
      users.users[user].recentNegaposi.length;
    users.users[user].last_seen = new Date();
    fs.writeFileSync(
      `${__dirname}/../users.db`,
      JSON.stringify(users, null, "\t")
    );
  },

  /**
   * 好感度を取得
   * @param {string} user
   * @return {Promise<number>}
   */
  async getFavoRate(user) {
    let users = JSON.parse(fs.readFileSync(`${__dirname}/../users.db`));
    if (!users.users[user]) {
      users.users[user] = {
        id: user,
        interested: [],
        recentNegaposi: [],
        favoRate: 0,
        last_seen: new Date(),
      };
    }

    return users.users[user].favoRate;
  },

  async isQuestions(text) {
    text = text.replace(/((h?)(ttps?:\/\/[a-zA-Z0-9.\-_@:/~?%&;=+#',()*!]+))/g, "").replace(/@[0-9a-zA-Z_]{1,15}/g, "");
    
    const reg01 = /なんですか|でしょうか|なんやろ|どうして|なんで/g;
    const reg005 = /か|どれ|何|なに|もしかして/g;
    const regSymbol003 = /\?|？/g;
    const regSymbol001 = /！\？|!?|🤔/g;
    
    let tokens = await require("./generate").tokenize(text);
    
    let probabilityOfQuestion = -0.01;
    tokens.forEach((token, i) => {
      if (regSymbol003.test(token.surface_form)) probabilityOfQuestion += 0.03;
      if (regSymbol001.test(token.surface_form)) probabilityOfQuestion += 0.01;
      
      const t = tokens[i - 1];
      if (t) {
        if (token.surface_form === "？" && t.surface_form.includes("（"))
          probabilityOfQuestion -= 0.01;
        if (token.surface_form === "？" && t.surface_form.includes("..."))
          probabilityOfQuestion += 0.02;
        if (token.surface_form === "?" && t.surface_form.includes("…"))
          probabilityOfQuestion += 0.02;
        if (token.surface_form === "？" && t.surface_form.includes("、、"))
          probabilityOfQuestion += 0.02;
        if (t.surface_form.includes("なん")) probabilityOfQuestion += 0.05;
        if (t.surface_form.includes("だい")) probabilityOfQuestion += 0.01;
        else if (t.surface_form.includes("なの")) probabilityOfQuestion += 0.05;
        if (reg01.test(token.surface_form)) probabilityOfQuestion += 0.1;
        if (token.surface_form === "？" && reg005.test(token.surface_form)) probabilityOfQuestion += 0.05;
      }
    });

    return probabilityOfQuestion;
  },

  async saveQueue(type, data) {
    let queues = JSON.parse(fs.readFileSync(`${__dirname}/../queues.json`));

    queues.queues[queues.queues.length] = {
      type,
      data,
      addedDate: new Date(),
    };

    fs.writeFileSync(
      `${__dirname}/../queues.json`,
      JSON.stringify(queues, null, "\t")
    );

    return queues.queues.length - 1;
  },

  async getQueue() {
    let queues = JSON.parse(fs.readFileSync(`${__dirname}/../queues.json`));

    return queues;
  },

  async deleteQueue(number) {
    let queues = JSON.parse(fs.readFileSync(`${__dirname}/../queues.json`));
    console.log(number);
    queues.queues.splice(number, 1);
    fs.writeFileSync(
      `${__dirname}/../queues.json`,
      JSON.stringify(queues, null, "\t")
    );
  },

  async getCharacter() {
    return JSON.parse(fs.readFileSync(`${__dirname}/../character.json`));
  },

  async isTwoChoiceQuestions(questionText) {
    questionText = questionText.replace(/((https?:\/\/[a-zA-Z0-9.\-_@:/~?%&;=+#',()*!]+))/g, "").replace(/@[0-9a-zA-Z_]{1,15}/g, "");

    const reg001 = /あれ|それ/g;
    const reg005 = /これ|どれ|それか/g;
    const reg010 = /それとも|どっち/g;
    
    const tokens = await require("./generate").tokenize(questionText);

    let result = -0.01;
    
    tokens.forEach((token, i) => {
      if (reg001.test(token.surface_form)) result += 0.01;
      if (reg005.test(token.surface_form)) result += 0.05;
      if (reg010.test(token.surface_form)) result += 0.1;

      if (tokens[i + 1]) {
        let t = tokens[i + 1];
        
        if (reg005.test(token.surface_form) && t === "なの") result += 0.01;
      }
    });

    return result;
  },

  async getQuestionReply(questionText) {
    questionText = questionText.replace(/((https?:\/\/[a-zA-Z0-9.\-_@:/~?%&;=+#',()*!]+))/g, "").replace(/@[0-9a-zA-Z_]{1,15}/g, "");
    
    async function getData() {
      let tokens = await require("./generate").tokenize(questionText);
      let result = [];
      for (let i = 0; i < tokens.length; i++) {
        if (tokens[i].pos === "名詞") result[result.length] = tokens[i].surface_form;
      }

      return result;
    }
    
    let part1 = (await getData())[Math.round(Math.random() * (((await getData()).length - 1) - 1)) + 1];
    const clause = ["やな", "やろ", "かな..."];

    const reg = /これ|それ|あれ|どれ|何/g;
    if (!part1　|| reg.test(part1)) {
      if (await module.exports.isTwoChoiceQuestions(questionText) > 0.07) {
        const yesOrNo = ["そう", "多分そう", "多分違う", "違う", "多分おかしい", "おかしい"];
        part1 = yesOrNo[Math.round(Math.random() * ((yesOrNo.length - 1) - 1)) + 1];
      } else {
        part1 = "🤔";
      }
    }
    
    return `${part1}${clause[Math.round(Math.random() * ((clause.length - 1) - 1)) + 1]}`;
  },

  async getReplySuggest(text) {
    text = text.replace(/((https?:\/\/[a-zA-Z0-9.\-_@:/~?%&;=+#',()*!]+))/g, "").replace(/@[0-9a-zA-Z_]{1,15}/g, "");
    
    const tokens = await require("./generate").tokenize(text);

    let result = "";
    
    tokens.forEach((token, i) => {
      if (token.basic_form === "おはよう") result = "おはよう";
      if (token.basic_form === "こんにちは") result = "こんにちは";
      if (token.basic_form === "こんばんは") result = "こんばんは";
      if (token.basic_form === "おやすみ") result = "おやすみ";

      if (token[i + 1]) {
        let t = token[i + 1];
        if (token.surface_form === "お" && t.surface_form === "は") result = "おはよ";
        if (token.surface_form === "こん" && t.surface_form === "ちゃ") result = "こんにちは";
      }
    });
  }
};
