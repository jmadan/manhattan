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
      })
      .catch(err => reject(err));
  });
};

let createCategory = category => {
  const session = driver.session();
  return new Promise((resolve, reject) => {
    session
      .run(
        'CREATE (c:CATEGORY {name: {name}, id: {id}, slug: {slug}}) RETURN c',
        {
          name: category.name,
          id: category._id.toString(),
          slug: category.slug
        }
      )
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
        .run(
          'MATCH (u:USER {email: $useremail}), (a:ARTICLE {articleid: $articleid}) MERGE (u)-[r:LIKES]->(a) RETURN r',
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

module.exports = {
  findUser,
  createUser,
  createParentChildRelationship,
  createCategory,
  createArticle,
  articleCategoryRelationship,
  userAction
};
