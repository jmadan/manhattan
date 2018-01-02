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

// 'CREATE (a:ARTICLE {id: {id}, title: {title}, provider: {provider}, author: {author}, pubdate: {pubdate}, url: {url}, keywords: {keywords}}) RETURN u'

let createArticle = article => {
  console.log('In Neo4j :- ', article.parent);
  const session = driver.session();
  return new Promise((resolve, reject) => {
    session
      .run(
        'MERGE (a:ARTICLE {id: {id}}), MERGE (c:CATEGORY {id: {parentcat}}) \
        ON CREATE SET a.title={title}, a.provider={provider}, a.author={author}, a.pubDate={pubDate}, a.url={url}, a.keywords={keywords} \
        MERGE (a)-[r:HAS_CATEGORY]->(c)',
        {
          id: article._id,
          parentcat: article.parent._id,
          title: article.title,
          provider: article.provider,
          author: article.author,
          pubDate: article.pubDate,
          url: article.url,
          keywords: article.keywords
        }
      )
      .then(result => {
        session.close();
        resolve({ msg: result });
      })
      .catch(err => reject(err));
  });
};

let articleCategoryRelationship = article => {
  const session = driver.session();
  return new Promise((resolve, reject) => {
    session
      .run(
        'MATCH (a:ARTICLE {id: {id}}) (c:CATEGORY {name: {name}}) \
        WHERE a.parentCategory.name = c.name \
        CREATE (a)-[r:BELONGS_TO]->(c) \
        RETURN r',
        {
          id: article._id,
          name: article.parentCategory.name
        }
      )
      .then(result => {
        session.close();
        resolve({ msg: result });
      })
      .catch(err => reject(err));
  });
};

let createCategory = category => {
  const session = driver.session();
  return new Promise((resolve, reject) => {
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
        .then(result => {
          session.close();
          resolve({ msg: result.records });
        })
        .catch(err => reject(err));
    }
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
            nameparentId: item.parent._id,
            childId: item._id
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

module.exports = {
  findUser,
  createUser,
  createParentChildRelationship,
  createCategory,
  createArticle,
  articleCategoryRelationship
};
