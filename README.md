
Reading Hackernews API and categorizing the articles.
Creating a feed of those articles based on the interest of the user.

MongoDB
=========
Create collections User, Interests and Stories
Create TextIndex on category attribute as db.stories.createIndex( { category: "text"} ) - it would help in performing multiword search on the category attribute to make a list of relevant stories.