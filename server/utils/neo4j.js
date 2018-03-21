const neo4j = require('neo4j-driver').v1;

const driver = neo4j.driver(
  process.env.NEO4J_URL,
  neo4j.auth.basic(process.env.NEO4J_USER, process.env.NEO4J_PASSWORD)
);

let getUser = user => {
  const session = driver.session();
  return new Promise((resolve, reject) => {
    session
      .run(
        'MATCH (u:USER {email: $email}) WITH u \
      MATCH (u)-[:LIKES]->(t:TAG) WITH u,t \
      RETURN u, collect(t.name) as tags',
        { email: user.email }
      )
      .then(result => {
        session.close();
        if (result.records.length > 0) {
          resolve({ user: result });
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
    switch (action) {
    case 'like':
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
      break;
    case 'unlike':
      session
        .run('MATCH (u:USER {email: $useremail})-[r:LIKES]->(a:ARTICLE {id: $id}) DELETE r RETURN a', {
          useremail: user.email,
          id: item._id.toString()
        })
        .then(result => {
          session.close();
          resolve({ msg: result });
        })
        .catch(err => reject(err));
      break;
    case 'dislike':
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
      break;
    case 'undislike':
      session
        .run('MATCH (u:USER {email: $useremail})-[r:DISLIKES]->(a:ARTICLE {id: $id}) DELETE r RETURN a', {
          useremail: user.email,
          id: item._id.toString()
        })
        .then(result => {
          session.close();
          resolve({ msg: result });
        })
        .catch(err => reject(err));
      break;
    case 'save':
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
      break;
    case 'unsave':
      session
        .run('MATCH (u:USER {email: $useremail})-[r:LATER]->(a:ARTICLE {id: $id}) DELETE r RETURN a', {
          useremail: user.email,
          id: item._id.toString()
        })
        .then(result => {
          session.close();
          resolve({ msg: result });
        })
        .catch(err => reject(err));
      break;
    case 'like-tag':
      session
        .run(
          'MERGE (t:TAG {name: $tag}) WITH t \
        MATCH (u:USER {email: $useremail}) \
        CREATE (u)-[r:LIKES]->(t) RETURN r',
          {
            useremail: user.email,
            tag: item
          }
        )
        .then(result => {
          session.close();
          resolve({ msg: result });
        })
        .catch(err => reject(err));
      break;
    case 'unlike-tag':
      session
        .run(
          'MATCH (t:TAG {name: $tag}) \
        MATCH (u:USER {email: $useremail}) \
        MATCH (u)-[r:LIKES]->(t) DELETE r',
          {
            useremail: user.email,
            tag: item
          }
        )
        .then(result => {
          session.close();
          resolve({ msg: result });
        })
        .catch(err => reject(err));
      break;
    default:
      break;
    }
  });
};

let userInterestIn = (userId, interestId, action) => {
  let query = null;
  if (action === 'add') {
    query = 'MATCH (u:USER {id: $userId}), (c:CATEGORY {id: $categoryId}) CREATE (u)-[r:INTERESTED_IN]->(c) RETURN r';
  } else {
    query = 'MATCH (u:USER {id: $userId})-[r:INTERESTED_IN]->(c:CATEGORY {id: $categoryId}) DELETE r';
  }
  // let query = 'MERGE (u:USER {id: $userId})-[r:INTERESTED_IN]->(c:CATEGORY {id: $categoryId}) return type(r)';
  const session = driver.session();
  session
    .run(query, {
      userId: userId.toString(),
      categoryId: interestId.toString()
    })
    .then(result => {
      session.close();
      console.log(result);
    })
    .catch(err => console.log(err));
};

let userRecommendation = (userid, interests) => {
  const session = driver.session();
  return new Promise((resolve, reject) => {
    session
      .run(
        'MATCH (a:ARTICLE)-[:HAS_CATEGORY]->(c:CATEGORY), (a)-[pub:PUBLISHED_BY]->(p:PROVIDER) \
      WHERE c.id in $InterestList \
      RETURN DISTINCT a.id AS id, a.title AS title, pub ORDER BY pub.pubDate DESC LIMIT 50 \
      UNION \
      match (u:USER {id: $userid})-[:LIKES]->(t:TAG) WITH t, collect(t.name) as tags \
      unwind tags as tag with tag \
      match (a:ARTICLE), (a)-[pub:PUBLISHED_BY]->(p:PROVIDER) where a.keywords contains tag \
      return DISTINCT a.id AS id, a.title AS title, pub ORDER BY pub.pubDate DESC LIMIT 50 \
      UNION \
      MATCH (a:ARTICLE)-[:HAS_CATEGORY]->(c:CATEGORY)-[:HAS_PARENT]-(cp:CATEGORY), (a)-[pub:PUBLISHED_BY]->(p:PROVIDER) \
      WHERE cp.id in $InterestList \
      RETURN DISTINCT a.id AS id, a.title AS title, pub ORDER BY pub.pubDate DESC LIMIT 50',
        {
          userid: userid.toString(),
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

let standardRecommendation = () => {
  const session = driver.session();
  return new Promise((resolve, reject) => {
    session
      .run(
        'MATCH (a:ARTICLE), (a)-[pub:PUBLISHED_BY]->(p:PROVIDER) \
      RETURN DISTINCT a.id AS id, a.title AS title, pub ORDER BY pub.pubDate DESC LIMIT 100'
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

let otherCategoryRecommendation = (userId) => {
  const session = driver.session();
  return new Promise((resolve, reject) => {
    session
      .run(
        'match (u:USER)-[:INTERESTED_IN]-(c:CATEGORY)-[:INTERESTED_IN]-(ou:USER) with u,ou,c \
        match (ou)-[:INTERESTED_IN]-(oc:CATEGORY) \
        where u.id=$userid AND NOT c=oc \
        Return DISTINCT oc.name as name',
        {
          userid: userId.toString()
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
  getUser,
  createUser,
  createParentChildRelationship,
  createCategory,
  createArticle,
  articleCategoryRelationship,
  userAction,
  userInterestIn,
  userRecommendation,
  standardRecommendation,
  userSavedList,
  otherCategoryRecommendation
};
