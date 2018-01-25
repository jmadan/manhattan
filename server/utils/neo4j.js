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
  return new Promise((resolve, reject) => {
    session
      .run('CREATE (user:USER {id: $userid, name: $name, email: $email}) RETURN user', {
        userid: user.id.toString(),
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
        'CREATE (a:ARTICLE {id: $id, title: $title, url: $url, keywords: $keywords}) \
        MERGE (author:AUTHOR {name: $author}) \
        MERGE (a)-[r:AUTHORED_BY]->(author) \
        MERGE (provider:PROVIDER {name: $provider}) \
        MERGE (a)-[ap:PUBLISHED_BY]->(provider) \
        ON CREATE SET ap.published_on=$pubDate \
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
    .run('MATCH (a:ARTICLE {id: $id}), (c:CATEGORY {id: $subCatId}) CREATE (a)-[r:HAS_CATEGORY]->(c) RETURN a', {
      id: article._id.toString(),
      subCatId: article.subcategory._id.toString()
    })
    .then(result => {
      session.close();
      console.log('Article node and Relationship created.');
      console.log(result.records[0]);
    })
    .catch(err => console.log(err));
};

let createCategory = category => {
  const session = driver.session();
  return new Promise((resolve, reject) => {
    session
      .run('CREATE (c:CATEGORY {name: $name, id: $id}) RETURN c', {
        name: category.name,
        id: category._id.toString()
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
          'MATCH (a:CATEGORY {id: $parentId}), (b:CATEGORY {id: $childId}) \
          CREATE (b)-[:HAS_PARENT]->(a)',
          {
            parentId: item.parent._id.toString(),
            childId: item._id.toString()
          }
        )
        .then(result => {
          session.close();
          resolve({ msg: result.records });
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
        .run('MATCH (u:USER {email: $useremail}), (a:ARTICLE {id: $id}) CREATE (u)-[r:LIKES]->(a) RETURN r', {
          useremail: user.email,
          id: item._id.toString()
        })
        .then(result => {
          session.close();
          resolve({ msg: result });
        })
        .catch(err => reject(err));
    } else if (action === 'dislike') {
      session
        .run('MATCH (u:USER {email: $useremail}), (a:ARTICLE {id: $id}) CREATE (u)-[r:DISLIKES]->(a) RETURN r', {
          useremail: user.email,
          id: item._id.toString()
        })
        .then(result => {
          session.close();
          resolve({ msg: result });
        })
        .catch(err => reject(err));
    } else if (action === 'save') {
      session
        .run('MATCH (u:USER {email: $useremail}), (a:ARTICLE {id: $id}) CREATE (u)-[r:LATER]->(a) RETURN r', {
          useremail: user.email,
          id: item._id.toString()
        })
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
    .run('MATCH (u:USER {id: $userId}), (c:CATEGORY {id: $categoryId}) CREATE (u)-[r:INTERESTED_IN]->(c) RETURN r', {
      userId: userId.toString(),
      categoryId: interestId.toString()
    })
    .then(result => {
      session.close();
      console.log(result);
    })
    .catch(err => console.log(err));
};

let userRecommendation = interests => {
  const session = driver.session();
  return new Promise((resolve, reject) => {
    session
      .run(
        'MATCH (a:ARTICLE)-[:HAS_CATEGORY]-(c:CATEGORY) WHERE c.id in $InterestList WITH a \
        MATCH (a)-[pub:PUBLISHED_BY]-(p:PROVIDER) \
        MATCH (a)-[:AUTHORED_BY]-(au:AUTHOR) \
        RETURN a.id AS id, a.title AS title, a.url AS url, a.keywords AS keywords,p.name AS provider,au.name AS author, pub.pubDate AS pubDate ORDER BY pub.pubDate DESC',
        {
          InterestList: interests
        }
      )
      .then(result => {
        session.close();
        resolve(result);
      })
      .catch(err => reject(err));
  });
};

let userSavedList = user => {
  const session = driver.session();
  return new Promise((resolve, reject) => {
    session
      .run(
        'MATCH (a:ARTICLE)<-[:LATER]-(user:USER) WHERE user.email = $UserEmail \
        RETURN a.id AS id, a.title AS title, a.url AS url',
        {
          UserEmail: user.email
        }
      )
      .then(result => {
        session.close();
        resolve(result);
      })
      .catch(err => reject(err));
  });
};

module.exports = {
  findUser,
  createUser,
  createParentChildRelationship,
  createCategory,
  createArticle,
  articleCategoryRelationship,
  userAction,
  userInterestIn,
  userRecommendation,
  userSavedList
};
