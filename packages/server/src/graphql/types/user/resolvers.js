//const {post: postModel} = require('../../db/models')
// const db = require("../../../database");
const { knex } = require("../../../database");
module.exports = {
  User: {
    // comments: async({id}, _, {dataLoaders: {postCommentLoader}}) => await postCommentLoader.load(id)
  },
  Query: {
    me: async (_, __, { dataLoaders, user }) => {
      return user;
      // const users = await db.getUsers();
      // users.forEach(user => {
      //   dataLoaders.user.prime(user.id, user);
      // });
      // return users;
    },
  }
};

// const {post: postModel} = require('../../db/models')

// module.exports = {
//     Post: {
//         comments: async({id}, _, {dataLoaders: {postCommentLoader}}) => await postCommentLoader.load(id)
//     },
//     Query: {
//         getPosts: async(_, __, {dataLoaders: {postLoader}}) => {
//             const posts = await postModel.findAll({
//                 order: [
//                     ['createdAt', 'desc']
//                 ]
//             })

//             posts.forEach(post => {
//                 postLoader.prime(post.id, post)
//             })

//             return posts
//         }
//     }
// }
