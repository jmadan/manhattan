const neo4j = require('neo4j-driver').v1;

// const driver = neo4j.driver('bolt://128.199.179.49:7687', neo4j.auth.basic('neo4j', 'I4z8A3tbSSJ&4!gK5$^G'));
const driver = neo4j.driver('bolt://128.199.179.49:7687', neo4j.auth.basic('neo4j', 'neo4j'));
const session = driver.session();

// let db = new neo4j.GraphDatabase('http://neo4j:I4z8A3tbSSJ&4!gK5$^G@159.89.194.46:7474');
let sessionClose = () => {
  session.close();
};

let findUser = user => {
  return new Promise((resolve, reject) => {
    session
      .run('MATCH (u:USER {email: $email}) RETURN u', { email: user.email })
      .then(result => {
        sessionClose();
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
  return new Promise((resolve, reject) => {
    session
      .run('CREATE (u:USER {name: {name}, email: {email}}) RETURN u', { name: user.name, email: user.email })
      .then(result => {
        resolve({ msg: result });
      })
      .catch(err => reject(err));
  });
};

let createArticle = article => {
  return new Promise((resolve, reject) => {
    session
      .run(
        'CREATE (a:ARTICLE {title: {title}, provider: {provider}, author: {author}, pubdate: {pubdate}, url: {url}, keywords: {keywords}}) RETURN u',
        {
          title: article.title,
          provider: article.provider,
          author: article.author,
          pubdate: article.pubdate,
          url: article.url,
          keywords: article.keywords
        }
      )
      .then(result => {
        resolve({ msg: result });
      })
      .catch(err => reject(err));
  });
};

let articleCategoryRelationship = article => {
  return new Promise((resolve, reject) => {
    session
      .run(
        'MATCH (a:ARTICLE) (c:CATEGORY) WHERE a.parentCategory.name = c.name CREATE (a)-[r:BELONGS_TO]->(c) RETURN r'
      )
      .then(result => {
        resolve({ msg: result });
      })
      .catch(err => reject(err));
  });
};

let createCategory = category => {
  return new Promise((resolve, reject) => {
    if (!category.parent) {
      session
        .run('CREATE (c:CATEGORY {name: {name}, id: {id}, slug: {slug}}) RETURN c', {
          name: category.name,
          id: category._id.toString(),
          slug: category.slug
        })
        .then(result => {
          resolve({ msg: result.records });
        })
        .catch(err => reject(err));
    } else {
      session
        .run('CREATE (c:CATEGORY {name: {name}, id: {id}, slug: {slug}, parent: {parent}}) RETURN c', {
          name: category.name,
          id: category._id.toString(),
          slug: category.slug,
          parent: category.parent.toString()
        })
        .then(result => {
          resolve({ msg: result.records });
        })
        .catch(err => reject(err));
    }
  });
};

let createParentChildRelationship = item => {
  console.log(item);
  return new Promise((resolve, reject) => {
    if (item.parent) {
      session
        .run(
          'MATCH (a:CATEGORY), (b:CATEGORY) WHERE a.parent = {parent} AND a.name = {name} AND b.id = {id} CREATE (a)-[:SUBCAT_OF]->(b)',
          {
            name: item.name,
            parent: item.parent.toString(),
            id: item.parent.toString()
          }
        )
        .then(result => {
          resolve({ msg: result.records });
        })
        .catch(err => reject(err));
    }
  });
};

module.exports = {
  findUser,
  createUser,
  createRelationship,
  createCategory
};
