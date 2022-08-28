var http = require('http');
const analyze = require('negaposi-analyzer-ja');

var base_url = "http://ap.mextractr.net/ma9/emotion_analyzer";
var apikey = process.env.metadata_api_key; //ここは変えてください
var out = "json";

module.exports = {
  /** 
  * @deprecated
  * Please use "analysis" function.
  */
  async emotionalAnalysis(text) {
    text = encodeURI(text);

    let url = `${base_url}?apikey=${apikey}&out=${out}&text=${text}`;

    let result = new Promise((resolve) => {
      http.get(url, (res) => {
        let body = '';
        res.setEncoding('utf8');

        // データ取得
        res.on('data', function(chunk){
          body += chunk;
        });

        res.on('end', function(res){
          let ret = JSON.parse(body);
          resolve(ret);
        })
      });
    });

    return await result;
  },
  async analysis(text) {
    const score = analyze(text);
    return score;
  }
}