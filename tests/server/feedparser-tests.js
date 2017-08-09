import 'babel-polyfill';
require("mocha-as-promised")();
let chai = require('chai');
let chaiHttp = require('chai-http');
let expect = chai.expect;
import * as feedParser from '../../server/modules/feed/feedparser';

describe('Testing the FeedParser logic', ()=>{
  it('should return feed lists', function(){
    this.timeout(3000);
    return feedParser.getRSSFeedList().then((value)=>{
      expect(value).to.have.property('feedlist').to.be.an('array').that.is.not.empty;
    });
  });

  it('expect to get feed details', function(){
    this.timeout(3000);
    let url="https://medium.com/feed/the-story";
    return feedParser.getRSSFeedDetails(url).then((result)=>{
      expect(result).to.be.an('array');
      expect(result).to.be.an('array').that.is.not.empty;
    })
  })

  it('expect to get RSS feed based on the feed list returned from DB', function(){
    
  })
});
