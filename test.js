// const rp = require('request-promise');
// var cheerio = require('cheerio');

// function testXML() {
//   rp('https://www.theverge.com/rss/index.xml').then(res => {
//     let $ = cheerio.load(res, {
//       withDomLvl1: true,
//       normalizeWhitespace: true,
//       xmlMode: true,
//       decodeEntities: true
//     });
//     $('entry').each(function () {
//       console.log(
//         $(this)
//           .find('content')
//           .text()
//           .replace(/<[^>]*>/g, '')
//       );
//     });
//   });
// }

const synaptic = require('./server/modules/nlp/synaptic');
const articles = require('./server/modules/article');

function testclass() {
  articles.fetchArticles('unclassified').then(docs => {
    synaptic.synapticClassify(docs[0]).then(val => {
      console.log(val.title, val.category);
    });
  });
}

testclass();
