var sinon = require('sinon');
var chai = require('chai');
var expect = chai.expect;

var mongoose = require('mongoose');
require('sinon-mongoose');

var Story = require('../models/story');

describe("Get all Stories", () => {

	it("should return all stories", (done) => {
		var StoryMock = sinon.mock(Story);
		var expectedResult = {
			status: true,
			story: []
		};
		StoryMock.expects('find').yields(null, expectedResult);
		Story.find((err, result) => {
			StoryMock.verify();
			StoryMock.restore();
			expect(result.status).to.be.true;
			done();
		});
	});

	it("should return an error", (done) => {
		var StoryMock = sinon.mock(Story);
		var expectedResult = {
			status: false,
			error: "Something went wrong"
		};
		StoryMock.expects('find').yields(expectedResult, null);
		Story.find((err, result) => {
			StoryMock.verify();
			StoryMock.restore();
			expect(err.status).to.not.be.true;
			done();
		});
	});
});