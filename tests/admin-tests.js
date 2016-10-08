import 'babel-polyfill';
let mongoose = require('mongoose');
let Category = require('../server/models/category');

let chai = require('chai');
let chaiHttp = require('chai-http');
let expect = chai.expect;

let Server = require('../server/index');

chai.use(chaiHttp);

describe('Admin', () => {

	describe('/GET base url', () => {
		it('it should check if base url is accessible', (done) => {
			chai.request('http://localhost:3000').get('/admin/api/').end((err, res) => {
				expect(res.status).to.eql(200);
				expect(res.body.message).to.eql("Need to call specific end points to get data");
				done();
			});
		});
	});

});

describe('Admin Category section', () => {
	beforeEach((done) => {
		Category.remove({}, (err) => {
			done();
		})
	});

	describe('/GET Category All', () => {
		it('Expect to fetch all categories', (done) => {
			chai.request('http://localhost:3000')
				.get('/admin/api/category/all')
				.end((err, res) => {
					expect(res.status).to.eql(200);
					expect(res.body.categories.length).to.eql(0);
					done();
				});
		});
	});

	describe('/POST Create a Category', () => {
		it('Expect to save a Category', (done) => {
			let category = {
				category: 'test-category',
				description: 'This is a test category for testing purposes'
			};
			chai.request('http://localhost:3000')
				.get('/admin/api/category/create')
				.send(category)
				.end((err, res) => {
					expect(res.body.message).to.eql('Category saved!');
					expect(res.status).to.eql(200);
					expect(res.body.success).to.eql(true);
					expect(res.body.category).to.be.a('object');
					done();
				});
		});
	});


});
