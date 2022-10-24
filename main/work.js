const request = require("request");
const action = require("./action");

module.exports = {
  addWorkQueue(workType = "random") {
    const workTypes = ["MMD"];
    
    action.saveQueue("work", {
      date: new Date(),
      work: workTypes[Math.round(Math.random() * ((workTypes.length - 1) - 1)) + 1]
    });
  }
};