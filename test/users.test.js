const request = require("supertest");
const app = require("../app");
const { dynamodb } = require("../db/db");
const USERS_TABLE = "pinterest-users";

const jwt = require("jsonwebtoken");

let token_user = {};
let token = "";

describe("User Routes", () => {
  afterAll(async () => {
    const email = "jest_test@example.com";
    const find_params = {
      TableName: USERS_TABLE,
      IndexName: "email-index",
      KeyConditionExpression: "email = :email",
      ExpressionAttributeValues: {
        ":email": email,
      },
    };
    const { Items } = await dynamodb.query(find_params).promise();
    const user = Items[0];
    const params = {
      TableName: USERS_TABLE,
      Key: {
        user_id: user.user_id,
      },
    };
    await dynamodb.delete(params).promise();
  });
  it("Should create a new user", async () => {
    const new_user = {
      username: "jest_test",
      email: "jest_test@example.com",
      password: "password123",
    };
    const response = await request(app)
      .post("/users/register")
      .send(new_user)
      .expect(201);

    expect(response.body.message).toBe("User created successfully");
  });

  it("Should throw incorrect password", async () => {
    const user = {
      email: "jest_test@example.com",
      password: "password1234",
    };
    const response = await request(app)
      .post("/users/login")
      .send(user)
      .expect(401);

    expect(response.body.message).toBe("Incorrect password");
  });

  it("Should login a user", async () => {
    const user = {
      email: "jest_test@example.com",
      password: "password123",
    };
    const response = await request(app)
      .post("/users/login")
      .send(user)
      .expect(200);

    expect(response.body.message).toBe("Authentication successful");
    expect(response.body.token).toBeDefined();
    token = response.body.token;
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    token_user = { user_id: decoded.user_id, username: decoded.username };
  });

  it("should get a user by ID", async () => {
    const user_id = token_user.user_id;
    const response = await request(app)
      .get(`/users/${user_id}`)
      .set("authorization", token)
      .expect(200);

    expect(response.body.user).toBeDefined();
    expect(response.body.user.user_id).toBe(user_id);
  });
  it("Should throw no token provided", async () => {
    const user_id = token_user.user_id;
    const response = await request(app).get(`/users/${user_id}`).expect(401);
    expect(response.body.message).toBe("Access denied. No token provided.");
  });
  it("should get all users", async () => {
    const response = await request(app)
      .get("/users")
      .set("authorization", token)
      .expect(200);

    expect(response.body.users).toBeDefined();
  });
  it("Should throw no token provided", async () => {
    const response = await request(app).get("/users/").expect(401);
    expect(response.body.message).toBe("Access denied. No token provided.");
  });
});
