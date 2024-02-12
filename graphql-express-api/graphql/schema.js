const { buildSchema } = require("graphql");

/**
 *   type TestData {
 *     text:String!
 *     views:Int!
 *     }
 *
 *     type RootQuery {
 *     hello:TestData!
 *     hi:TestData!
 *     }
 *
 *     schema {
 *     query:RootQuery
 *     }
 *
 * */

module.exports = buildSchema(`
    type Post {
    id:ID!
    title:String!
    content:String!
    imageUrl:String!
    creator:User!
    createAt:String!
    updateAt:String!
    }

    type User{
        id:ID!
       email:String!
       name:String!
       password:String
       status:Int
       posts:[Post!]!
       token:String
    }
    input PostInput {
        title:String!
        content:String!
        imageUrl:String!
    }
    input UserInputData {
        email:String!
        name:String!
        password:String!
    }

    type loginType{
     userId:String!
     token:String!
     status:Int!
     }

    type RootQuery{
   login(email:String!,password:String!):loginType
    }
    type RootMutation {
    createUser(userInput:UserInputData):User
    createPost(input:PostInput!):Post
   
    }

     schema {
        query:RootQuery
        mutation:RootMutation
      }

`);
