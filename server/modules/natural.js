let natural = require('natural');

let porterStemmer = natural.PorterStemmer;
let lancasterStemmer = natural.LancasterStemmer;

porterStemmer.attach();

exports.tokenandstem = (text) => {
  if(text){
    return text.tokenizeAndStem();
  }
}

exports.lancasterStem = (text) => {
  return lancasterStemmer.tokenizeAndStem(text);
}
