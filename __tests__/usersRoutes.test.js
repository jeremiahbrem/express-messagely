process.env.NODE_ENV === "test"

const request = require("supertest");
const jwt = require("jsonwebtoken");
const { SECRET_KEY } = require("../config");
const app = require("../app");
const db = require("../db");
const User = require("../models/user");
const Message = require("../models/message");

describe("Users Routes Test", function () {
  let testToken;

  beforeEach(async function () {
    await db.query("DELETE FROM messages");
    await db.query("DELETE FROM users");
    await db.query("ALTER SEQUENCE messages_id_seq RESTART WITH 1");

    let testUser = await User.register({
      username: "test1",
      password: "password",
      first_name: "Test1",
      last_name: "Testy1",
      phone: "+14155550000",
    });
    testToken = jwt.sign(testUser, SECRET_KEY);

    let u2 = await User.register({
      username: "test2",
      password: "password",
      first_name: "Test2",
      last_name: "Testy2",
      phone: "+14155552222",
    });

    let m1 = await Message.create({
      from_username: "test1",
      to_username: "test2",
      body: "u1-to-u2"
    });

    let m2 = await Message.create({
      from_username: "test2",
      to_username: "test1",
      body: "u2-to-u1"
    });
  });

  describe("GET /users/", function () {
    test("Get list of users", async function () {
      let response = await request(app)
        .get("/users/").send({_token: testToken});

      expect(response.statusCode).toEqual(200);
      expect(response.body).toEqual({
               users:   
                  [{
                   username: "test1",
                   first_name: "Test1",
                   last_name: "Testy1",
                   phone: "+14155550000"
                  },
                  {
                   username: "test2",
                   first_name: "Test2",
                   last_name: "Testy2",
                   phone: "+14155552222"
                  }]
                })   
    });
  });

  describe("GET /users/ failure", function () {
    test("Get 401 if not logged in", async function() {
      let response = await request(app)
        .get("/users/");
      expect(response.statusCode).toEqual(401);  
    })

    test("Get 401 if wrong token", async function() {
      let response = await request(app)
        .get("/users/").send({_token: "wrongToken"})
    })
  })

  describe("GET /users/username", function () {
    test("Get a single user", async function () {
      let response = await request(app)
        .get("/users/test1").send({_token: testToken});
      expect(response.statusCode).toEqual(200);
      expect(response.body).toEqual({
          user: {
            username: "test1", 
            first_name: "Test1", 
            last_name: "Testy1", 
            phone: "+14155550000", 
            join_at: expect.any(String),
            last_login_at: expect.any(String)
          }
      }) 
    })
  })

  describe("GET /users/username failure", function () {
    test("Get 401 not user", async function() {
      let response = await request(app)
        .get("/users/testOne");
      expect(response.statusCode).toEqual(401);  
    })

    test("Get 401 if wrong token", async function() {
      let response = await request(app)
        .get("/users/test1").send({_token: "wrongToken"})
    })
  })

  describe("GET /users/username/to", function () {
    test("Get all messages sent to user", async function() {
      let response = await request(app)
        .get("/users/test1/to").send({_token: testToken});
      expect(response.statusCode).toEqual(200);
      expect(response.body).toEqual({
          messages: [{
            id: expect.any(Number), 
            body: "u2-to-u1", 
            sent_at: expect.any(String),
            read_at: null,
            from_user: {
              username: "test2",
              first_name: "Test2",
              last_name: "Testy2",
              phone: "+14155552222"
            }
          }]
      })   
    })
  })
  
  describe("GET /users/username/from", function () {
    test("Get all messages sent to user", async function() {
      let response = await request(app)
        .get("/users/test1/from").send({_token: testToken});
      expect(response.statusCode).toEqual(200);
      expect(response.body).toEqual({
          messages: [{
            id: expect.any(Number), 
            body: "u1-to-u2", 
            sent_at: expect.any(String),
            read_at: null,
            to_user: {
              username: "test2",
              first_name: "Test2",
              last_name: "Testy2",
              phone: "+14155552222"
            }
          }]
      })   
    })
  })

})  

afterAll(async function () {
  await db.end();
});
