const request = require("supertest");

const app = require("../app");
const { dynamodb } = require("../db/db");

let token = "";
let id = "";

describe("Images Routes", () => {
  beforeAll(async () => {
    const user = { email: "anurgazin@gmail.com", password: "abc@123" };
    const response = await request(app)
      .post("/users/login")
      .send(user)
      .expect(200);
    token = response.body.token;
  });
  it("Should upload image", async () => {
    const buffer = Buffer.from("./test_images/test_img.jpg");
    const response = await request(app)
      .post(`/images/`)
      .set("authorization", token)
      .field("image_name", "test_image")
      .field("tags[]", ["test", "image"])
      .attach("image", buffer, "test_img.jpg")
      .expect(201);
    expect(response.body.message).toBe("Image uploaded");
    expect(response.body.image_id).toBeDefined();
    id = response.body.image_id;
  });

  it("Should throw no token provided", async () => {
    const buffer = Buffer.from("./test_images/test_img.jpg");
    const response = await request(app)
      .post(`/images/`)
      .field("image_name", "test_image")
      .field("tags[]", ["test", "image"])
      .attach("image", buffer, "test_img.jpg")
      .expect(401);
    expect(response.body.message).toBe("Access denied. No token provided.");
  });

  it("Should get all images", async () => {
    const response = await request(app)
      .get("/images")
      .set("authorization", token)
      .expect(200);

    expect(response.body.images).toBeDefined();
  });

  it("Should get image by id", async () => {
    const response = await request(app)
      .get(`/images/${id}`)
      .set("authorization", token)
      .expect(200);

    expect(response.body.image).toBeDefined();
  });

  it("Should return 404(get image by id)", async () => {
    const response = await request(app)
      .get(`/images/1`)
      .set("authorization", token)
      .expect(404);

    expect(response.body.message).toBe("Image not found");
  });

  it("Should return 404(delete image by id)", async () => {
    const response = await request(app)
      .delete(`/images/delete/1`)
      .set("authorization", token)
      .expect(404);

    expect(response.body.message).toBe("Image not found");
  });

  it("Should return 405(Not Allowed)(delete image by id)", async () => {
    const user = { email: "anurgazin2@gmail.com", password: "abc@123" };
    const user_response = await request(app)
      .post("/users/login")
      .send(user)
      .expect(200);
    const user_token = user_response.body.token;

    const response = await request(app)
      .delete(`/images/delete/${id}`)
      .set("authorization", user_token)
      .expect(405);

    expect(response.body.message).toBe("Not Allowed to Delete This Image");
  });

  it("Should delete image by id", async () => {
    const response = await request(app)
      .delete(`/images/delete/${id}`)
      .set("authorization", token)
      .expect(200);

    expect(response.body.message).toBe("Deleted successfully");
  });
});
