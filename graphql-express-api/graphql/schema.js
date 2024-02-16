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
        _id:ID!
        title:String!
        content:String!
        imageUrl:String!
        creator:User!
        createdAt:String!
        updatedAt:String!
    }

    type User{
        _id:ID!
       email:String!
       name:String!
       password:String
       status:Int
       posts:[Post!]!
      
    }
    type postDataType{
        posts:[Post!]!
        totalPost:Int!
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

    input postUpdate {
        title:String!
        content:String!
        imageUrl:String!
        id:ID!
    }
    type loginType{
         userId:String!
         token:String!
         status:Int!
     }

    type deleteType{
        _id:ID!
        message:String!
    }

    type RootQuery{
       login(email:String!,password:String!):loginType!
       getPosts(page:Int):postDataType!
       post(id:ID!):Post!
       deletePost(id:ID!):deleteType!
    }
    
    type RootMutation {
        createUser(userInput:UserInputData):User!
        createPost(input:PostInput!):Post!
        updatePost(input:postUpdate):Post!
    }

     schema {
        query:RootQuery
        mutation:RootMutation
     }

`);
