process.env.NODE_ENV === "test"

const request = require("supertest");
const jwt = require("jsonwebtoken");
const { SECRET_KEY } = require("../config");
const app = require("../app");
const db = require("../db");
const User = require("../models/user");
const Message = require("../models/message");

describe("Messages Routes Test", function () {
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

    let u3 = await User.register({
      username: "test3",
      password: "password",
      first_name: "Test3",
      last_name: "Testy3",
      phone: "+14155554444",
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
    
    let m3 = await Message.create({
      from_username: "test3",
      to_username: "test2",
      body: "u3-to-u2"
    });

    
  });

  describe("GET /messages/id", function () {
    test("Get message details", async function () {
      let response = await request(app)
        .get("/messages/1").send({_token: testToken});

      expect(response.statusCode).toEqual(200);
      expect(response.body).toEqual({
              message: {
                id: expect.any(Number),
                body: "u1-to-u2",
                sent_at: expect.any(String),
                read_at: null,
                from_user: {
                    username: "test1",
                    first_name: "Test1",
                    last_name: "Testy1",
                    phone: "+14155550000",
                },
                to_user: {
                    username: "test2",
                    first_name: "Test2",
                    last_name: "Testy2",
                    phone: "+14155552222",
                },
              }
            });      
    });
  });

  describe("GET /messages/id fail", function() {
    test("Get message details when unauthorized", async function() {
      let response = await request(app) 
        .get("/messages/3").send({_token: testToken});

      expect(response.statusCode).toEqual(401);
    })
      
    test("Get message details when logged out", async function() {
      let response = await request(app)
        .get("/messages/2");

      expect(response.statusCode).toEqual(401);  
    })
  })

  describe("POST /messages", function() {
    test("Post new message", async function() {
      let response = await request(app)
        .post("/messages").send({
                        _token: testToken,
                        to_username: "test2",
                        body: "Hi test2."
                        })
      expect(response.statusCode).toEqual(201);
      expect(response.body).toEqual({
                         message: {
                            id: expect.any(Number),
                            from_username: "test1",
                            to_username: "test2",
                            body: "Hi test2.",
                            sent_at: expect.any(String)
                         }
      })                  
    })
  })

  describe("POST /message/id/read", function() {
    test("Post mark message as read", async function() {
      let response = await request(app)
        .post("/messages/2/read").send({_token: testToken});
      expect(response.statusCode).toEqual(201);
      expect(response.body).toEqual({
                          message: {
                            id: expect.any(Number),
                            read_at: expect.any(String)
                          }
      })
    })
  })

  describe("POST /messages/id/read failure", function() {
    test("Post mark read message unauthoried", async function() {
      let response = await request(app)
        .post("/messages/1/read").send({_token: testToken});
      expect(response.statusCode).toEqual(401);
    })
  })

  /** POST/:id/read - mark message as read:
 *
 *  => {message: {id, read_at}}
 *
 * Make sure that the only the intended recipient can mark as read.
 *
 **/

})
 

afterAll(async function () {
  await db.end();
});
