import 'babel-polyfill';
require("mocha-as-promised")();
let chai = require('chai');
let chaiHttp = require('chai-http');
let expect = chai.expect;
import * as feedParser from '../../server/modules/feed/feedparser';

describe('Testing the FeedParser logic', ()=>{
  it('should return RSS feed list', function(){
    this.timeout(3000);
    return feedParser.getRSSFeedProviders().then((value)=>{
      expect(value).to.have.property('list').to.be.an('array').that.is.not.empty;
    });
  });

  it('expect to have rss feed retrived for every provider', function(){
    let providers = {list:[
      {
        "_id":"5982fda4734d1d04a1b3fdeb",
        "name":"techcrunch",
        "url":"http://feeds.feedburner.com/TechCrunch/",
        "topic":"all"
      },
      {
        "_id":"598301e4734d1d04a1b3ff3f",
        "name":"venturebeat",
        "url":"http://feeds.feedburner.com/venturebeat/SZYF",
        "topic":"all"
      }]
    };
    return feedParser.getFeedForProviders(providers).then((value)=>{
      expect(value).to.be.an('array');
      expect(value).to.have.lengthOf(2);
    });
  });

});
