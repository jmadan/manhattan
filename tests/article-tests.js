import 'babel-polyfill';
require("mocha-as-promised")();
let chai = require('chai');
let chaiHttp = require('chai-http');
let expect = chai.expect;
import * as article from '../src/modules/article';

describe('tests for article', ()=>{
  it('Given a sentence, Should return array of stemmed words', function(){
    let doc = {
      itembody: "This is a test!"
    }
    let expected = {
      itembody: "This is a test!",
      stemwords: ['test'],
      corpus:{}
    };
    let returned = article.getStemmedDoc(doc);
      expect(returned).to.be.an('object');
      expect(returned).to.deep.equal(expected);
  });

});
