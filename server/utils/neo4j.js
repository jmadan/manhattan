const neo4j = require('neo4j-driver').v1;

const driver = neo4j.driver(
  process.env.NEO4J_URL,
  neo4j.auth.basic(process.env.NEO4J_USER, process.env.NEO4J_PASSWORD)
);

let findUser = user => {
  const session = driver.session();
  return new Promise((resolve, reject) => {
    session
      .run('MATCH (u:USER {email: $email}) RETURN u', { email: user.email })
      .then(result => {
        session.close();
        if (result.records.length > 0) {
          resolve({ user: result.records[0] });
        }
        resolve({ user: null });
      })
      .catch(err => {
        reject(err);
      });
  });
};

let createUser = user => {
  const session = driver.session();
<<<<<<< HEAD
  return new Promise((resolve, reject) => {
    session
      .run('CREATE (user:USER {name: {name}, email: {email}}) RETURN user', {
        name: user.name,
        email: user.email
      })
      .then(result => {
        session.close();
        resolve(result);
      })
      .catch(err => reject(err));
  });
};

let createArticle = article => {
  const session = driver.session();
  return new Promise((resolve, reject) => {
    session
      .run(
        'MERGE (a:ARTICLE {articleid: $id, title: $title, provider: $provider, author: $author, pubDate: $pubDate, url: $url, keywords: $keywords}) RETURN a',
        {
          id: article._id.toString(),
          title: article.title,
          provider: article.provider,
          author: article.author,
          pubDate: article.pubDate.toString(),
          url: article.url,
          keywords: article.keywords.toString()
        }
      )
      .then(result => {
        session.close();
        resolve({ msg: result.records[0] });
      })
      .catch(err => reject(err));
  });
};

let articleCategoryRelationship = article => {
  const session = driver.session();
  return new Promise((resolve, reject) => {
    session
      .run(
        'MATCH (a:ARTICLE {articleid: $id}), (c:CATEGORY {id: $parentid}) MERGE (a)-[r:HAS_CATEGORY]->(c) RETURN a',
        {
          id: article._id.toString(),
          parentid: article.parentcat._id.toString()
        }
      )
      .then(result => {
        session.close();
        resolve({ msg: result.records[0] });
=======
  return new Promise((resolve, reject) => {
    session
      .run('CREATE (user:USER {name: {name}, email: {email}}) RETURN user', {
        name: user.name,
        email: user.email
      })
      .then(result => {
        session.close();
        resolve(result);
>>>>>>> 296d07b081466d0b1beca52c707e11aae736011b
      })
      .catch(err => reject(err));
  });
};

let createArticle = article => {
  const session = driver.session();
  return new Promise((resolve, reject) => {
    session
      .run(
        'MERGE (a:ARTICLE {id: $id, title: $title, url: $url, keywords: $keywords}) \
        MERGE (author:AUTHOR {name: $author}) \
        MERGE (a)-[r:PUBLISHED_BY]->(author) \
        ON CREATE SET r.published_on=$pubDate \
        MERGE (provider:PROVIDER {name: $provider}) \
        MERGE (a)-[:PUBLISHED_ON]->(provider) \
        RETURN a',
        {
          id: article._id.toString(),
          title: article.title,
          provider: article.provider,
          author: article.author,
          pubDate: article.pubDate.toString(),
          url: article.url,
          keywords: article.keywords.toString()
        }
      )
      .then(result => {
        session.close();
        resolve({ msg: result.records[0] });
      })
      .catch(err => reject(err));
  });
};

let articleCategoryRelationship = article => {
  const session = driver.session();
  session
    .run(
      'MATCH (a:ARTICLE {id: $id}), (c:CATEGORY {id: $subCatId}) MERGE (a)-[r:HAS_CATEGORY]->(c) RETURN a',
      {
        id: article._id.toString(),
        subCatId: article.subcategory._id.toString()
      }
    )
    .then(result => {
      session.close();
      console.log(result.records[0]);
    })
    .catch(err => console.log(err));
};

let createCategory = category => {
  const session = driver.session();
  return new Promise((resolve, reject) => {
<<<<<<< HEAD
    session
      .run('CREATE (c:CATEGORY {name: {name}, id: {id}, slug: {slug}}) RETURN c', {
        name: category.name,
        id: category._id.toString(),
        slug: category.slug
      })
      .then(result => {
        session.close();
        resolve({ msg: result.records });
      })
      .catch(err => reject(err));
  });
};

let createParentChildRelationship = item => {
  console.log(item);
  const session = driver.session();
  return new Promise((resolve, reject) => {
    if (item.parent) {
      session
        .run(
          'MATCH (a:CATEGORY {id: {parentId}}), (b:CATEGORY {id: {childId}}) \
          MERGE (a)-[:HAS_SUBCATEGORY]->(b)',
          {
            parentId: item.parent._id.toString(),
            childId: item._id.toString()
          }
        )
=======
    if (!category.parent) {
      session
        .run('CREATE (c:CATEGORY {name: {name}, id: {id}, slug: {slug}}) RETURN c', {
          name: category.name,
          id: category._id.toString(),
          slug: category.slug
        })
        .then(result => {
          session.close();
          resolve({ msg: result.records });
        })
        .catch(err => reject(err));
    } else {
      session
        .run('CREATE (c:CATEGORY {name: {name}, id: {id}, slug: {slug}, parent: {parent}}) \
          RETURN c', {
            name: category.name,
            id: category._id.toString(),
            slug: category.slug,
            parent: category.parent.toString()
          })
>>>>>>> 296d07b081466d0b1beca52c707e11aae736011b
        .then(result => {
          session.close();
          resolve({ msg: result.records });
        })
        .catch(err => reject(err));
    }
  });
};

<<<<<<< HEAD
let userAction = (user, action, item) => {
=======
let createParentChildRelationship = item => {
  console.log(item);
>>>>>>> 296d07b081466d0b1beca52c707e11aae736011b
  const session = driver.session();
  return new Promise((resolve, reject) => {
    if (action === 'like') {
      session
        .run(
<<<<<<< HEAD
          'MATCH (u:USER {email: $useremail}), (a:ARTICLE {articleid: $articleid}) MERGE (u)-[r:LIKES]->(a) RETURN r',
          {
            useremail: user.email,
            articleid: item._id.toString()
=======
          'MATCH (a:CATEGORY {id: {parentId}}), (b:CATEGORY {id: {childId}}) \
          MERGE (b)-[:IS_SUBCATEGORY_OF]->(a)',
          {
            parentId: item.parent._id.toString(),
            childId: item._id.toString()
>>>>>>> 296d07b081466d0b1beca52c707e11aae736011b
          }
        )
        .then(result => {
          session.close();
<<<<<<< HEAD
          resolve({ msg: result });
=======
          resolve({ msg: result.records });
>>>>>>> 296d07b081466d0b1beca52c707e11aae736011b
        })
        .catch(err => reject(err));
    }
  });
};

let userAction = (user, action, item) => {
  const session = driver.session();
  return new Promise((resolve, reject) => {
    if (action === 'like') {
      session
        .run(
          'MATCH (u:USER {email: $useremail}), (a:ARTICLE {id: $articleid}) MERGE (u)-[r:LIKES]->(a) RETURN r',
          {
            useremail: user.email,
            articleid: item._id.toString()
          }
        )
        .then(result => {
          session.close();
          resolve({ msg: result });
        })
        .catch(err => reject(err));
    } else if (action === 'dislike') {
      session
        .run(
          'MATCH (u:USER {email: $useremail}), (a:ARTICLE {id: $articleid}) MERGE (u)-[r:DISLIKES]->(a) RETURN r',
          {
            useremail: user.email,
            articleid: item._id.toString()
          }
        )
        .then(result => {
          session.close();
          resolve({ msg: result });
        })
        .catch(err => reject(err));
    }
  });
};

let userInterestIn = (userId, interestId) => {
  const session = driver.session();
  session
    .run(
      'MATCH (u:USER {id: $userId}), (c:CATEGORY {id: $categoryId}) MERGE (u)-[r:INTERESTED_IN]->(c) RETURN r',
      {
        userId: userId.toString(),
        categoryId: interestId.toString()
      }
    )
    .then(result => {
      session.close();
      console.log(result);
    })
    .catch(err => console.log(err));
};


module.exports = {
  findUser,
  createUser,
  createParentChildRelationship,
  createCategory,
  createArticle,
  articleCategoryRelationship,
<<<<<<< HEAD
  userAction
=======
  userAction,
  userInterestIn
>>>>>>> 296d07b081466d0b1beca52c707e11aae736011b
};
