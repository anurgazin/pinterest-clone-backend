const request = require("supertest");
const app = require("../app");

describe("User Routes", () => {
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

  it("should get a user by ID", async () => {
    const user = {
      email: "jest_test@example.com",
      password: "password123",
    };
    const login_response = await request(app)
      .post("/users/login")
      .send(user)
      .expect(200);
    const token = login_response.body.token;

    const user_id = "56d55c54-b431-4a23-83ef-5b7cc9d544a8";
    const response = await request(app)
      .get(`/users/${user_id}`)
      .set("authorization", token)
      .expect(200);

    expect(response.body.user).toBeDefined();
    expect(response.body.user.user_id).toBe(user_id);
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
  });
});
