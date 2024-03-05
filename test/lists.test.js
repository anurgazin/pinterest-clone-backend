const request = require("supertest");

const app = require("../app");

const list_name = "test_list";
let token = "";

const login_user = async (flag) => {
  const user =
    flag === 1
      ? { email: "anurgazin@gmail.com", password: "abc@123" }
      : { email: "anurgazin2@gmail.com", password: "abc@123" };
  const response = await request(app)
    .post("/users/login")
    .send(user)
    .expect(200);
  return response.body.token;
};

describe("Images Routes", () => {
  beforeAll(async () => {
    token = await login_user(1);
  });
  it("Should Create a List", async () => {
    const body = {
      image_id: "ebbfc623-43de-4943-a2b8-7dd08be13db6",
      list_name: list_name,
    };
    const response = await request(app)
      .post("/lists")
      .send(body)
      .set("authorization", token)
      .expect(201);
    expect(response.body.message).toBe("Image added to the list successfully");
    expect(response.body.flag).toBe(0);
  });

  it("Should Throw Not Allowed (add to the List)", async () => {
    const body = {
      image_id: "ebbfc623-43de-4943-a2b8-7dd08be13db6",
      list_name: list_name,
    };
    const tmp_token = await login_user(2);
    const response = await request(app)
      .post("/lists")
      .send(body)
      .set("authorization", tmp_token)
      .expect(405);
    expect(response.body.message).toBe("Not Allowed to Update this List");
  });

  it("Should Throw Image already in the list", async () => {
    const body = {
      image_id: "ebbfc623-43de-4943-a2b8-7dd08be13db6",
      list_name: list_name,
    };
    const response = await request(app)
      .post("/lists")
      .send(body)
      .set("authorization", token)
      .expect(409);
    expect(response.body.message).toBe("Image already in the list");
  });
  it("Should Add to existing List", async () => {
    const body = {
      image_id: "aa059992-4167-4a51-9647-0796787ee575",
      list_name: list_name,
    };
    const response = await request(app)
      .post("/lists")
      .send(body)
      .set("authorization", token)
      .expect(201);
    expect(response.body.message).toBe("Image added to the list successfully");
    expect(response.body.flag).toBe(1);
  });
  it("Should Throw Image Not Found(adding image to the list)", async () => {
    const body = {
      image_id: "123",
      list_name: list_name,
    };
    const response = await request(app)
      .post("/lists")
      .send(body)
      .set("authorization", token)
      .expect(404);
    expect(response.body.message).toBe("Image not found");
  });

  it("Should Throw Image Not Found(delete from list)", async () => {
    const body = {
      image_id: "123",
      list_name: list_name,
    };
    const response = await request(app)
      .put("/lists/remove_from")
      .send(body)
      .set("authorization", token)
      .expect(404);
    expect(response.body.message).toBe("Image not found in the list");
  });

  it("Should Throw Not Allowed(delete from list)", async () => {
    const body = {
      image_id: "ebbfc623-43de-4943-a2b8-7dd08be13db6",
      list_name: list_name,
    };
    const tmp_token = await login_user(2);
    const response = await request(app)
      .put("/lists/remove_from")
      .send(body)
      .set("authorization", tmp_token)
      .expect(405);
    expect(response.body.message).toBe(
      "Not Allowed to Delete Image from this List"
    );
  });

  it("Should Throw List Not Found(delete from list)", async () => {
    const body = {
      image_id: "ebbfc623-43de-4943-a2b8-7dd08be13db6",
      list_name: "list_name",
    };
    const response = await request(app)
      .put("/lists/remove_from")
      .send(body)
      .set("authorization", token)
      .expect(404);
    expect(response.body.message).toBe("List not found");
  });

  it("Should Delete Image from the list", async () => {
    const body = {
      image_id: "ebbfc623-43de-4943-a2b8-7dd08be13db6",
      list_name: list_name,
    };
    const response = await request(app)
      .put("/lists/remove_from")
      .send(body)
      .set("authorization", token)
      .expect(200);
    expect(response.body.message).toBe(
      "Image removed from the list successfully"
    );
  });

  it("Should Throw List not found (Delete the list)", async () => {
    const response = await request(app)
      .delete(`/lists/list_name`)
      .set("authorization", token)
      .expect(404);
    expect(response.body.message).toBe("List not found");
  });

  it("Should Throw Not Allowed (Delete the list)", async () => {
    const tmp_token = await login_user(2);
    const response = await request(app)
      .delete(`/lists/${list_name}`)
      .set("authorization", tmp_token)
      .expect(405);
    expect(response.body.message).toBe("Not Allowed to Delete List");
  });

  it("Should Delete the list", async () => {
    const response = await request(app)
      .delete(`/lists/${list_name}`)
      .set("authorization", token)
      .expect(200);
    expect(response.body.message).toBe("Deleted successfully");
  });
});
