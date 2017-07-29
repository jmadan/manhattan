import assert from 'assert';
import http from 'http';

import '../src/index';

describe('Testing the server', ()=>{
  it('should return 200', done => {
    http.get('http://localhost:3000', res => {
      assert.equal(200, res.statusCode);
      done();
    });
  });
});
