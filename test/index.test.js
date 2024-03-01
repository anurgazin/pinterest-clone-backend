const request = require("supertest");
const app = require("../app");
const { version, author, documentation } = require("../package.json");

describe("Index Routes", () => {
  it("Health Check Route", async () => {
    const response = await request(app).get("/").expect(200);

    expect(response.body.message).toBe(
      "Welcome to the Pinterest API, please look at the documentation for more information"
    );
    expect(response.body.author).toBe(author);
    expect(response.body.version).toBe(version);
  });

  it("Documentation Route", async () => {
    const response = await request(app).get("/documentation").expect(200);

    expect(response.body.message).toBe("Read Documentation in the Readme file");
    expect(response.body.documentation).toBe(documentation);
    expect(response.body.author).toBe(author);
    expect(response.body.version).toBe(version);
  });
});
