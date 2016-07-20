var sinon = require('sinon');
var chai = require('chai');
var expect = chai.expect;

var mongoose = require('mongoose');
require('sinon-mongoose');

var Story = require('../models/story');

describe("Save stories", () => {

	it("should create a new story", (done) => {
		var StoryMock = sinon.mock(new Story({
			storyId: '111',
			title: 'test title',
			url: 'http://someurl',
			storyType: 'story',
			timeSubmitted: new Date(),
			score: 23,
			source: 'hackerNews'
		}));
		var story = StoryMock.object;
		var expectedResult = {
			status: true
		};
		StoryMock.expects('save').yields(null, expectedResult);
		story.save((err, result) => {
			StoryMock.verify();
			StoryMock.restore();
			expect(result.status).to.be.true;
			done();
		});
	})

});