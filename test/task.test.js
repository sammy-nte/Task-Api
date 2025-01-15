import { expect } from "chai";
import request from "supertest";
import app from "../src/index.mjs";

async function createTask(title) {
  return await request(app).post("/task").send({ title });
}

const STATUS_CODES = {
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  NOT_FOUND: 404,
  NO_CONTENT: 204
};

describe("Task Api", () => {
  beforeEach(() => {
    app.locals.taskArray = [];
    app.locals.taskId = 1;
  });

  describe("POST /task", () => {
    it("should create a new task with valid content", async () => {
      const response = await request(app)
        .post("/task")
        .send({ title: "Take out the trash" })
        .expect(STATUS_CODES.CREATED);

      expect(response.headers["content-type"]).to.match(/^application\/json/);
      expect(response.body).to.have.property("id");
      expect(response.body).to.include({
        title: "Take out the trash"
      });
    });

    it("should return an error when title is empty", async () => {
      const response = await request(app).post("/task").send({});

      expect(response.status).to.equal(STATUS_CODES.BAD_REQUEST);
      expect(response.body).to.property("error", "Title is required");
    });
  });

  describe("GET /task", () => {
    it("should return an empty array initially", async () => {
      const response = await request(app).get("/task");
      expect(response.body).to.be.an("array").that.is.empty;
    });

    it("should return all task in task array", async () => {
      await createTask("Learn react native");
      await createTask("Learn SWR");
      const response = await request(app).get("/task");

      expect(response.status).to.equal(STATUS_CODES.OK);
      expect(response.body).to.have.lengthOf(2);
    });

    describe("GET /task/:id", () => {
      it("should return a task based on an taskId", async () => {
        const task = await createTask("Clean your room");
        const response = await request(app).get(`/task/${task.body.id}`);
        expect(response.status).to.equal(STATUS_CODES.OK);
        expect(response.body).to.have.property("id");
      });

      it("should return an error when taskId is not found", async () => {
        const irrId = 1000;
        await createTask("Finish the project");
        const response = await request(app).get(`/task/${irrId}`);

        expect(response.status).to.equal(STATUS_CODES.NOT_FOUND);
        expect(response.body).to.have.property("error", "Task not found");
      });
    });
  });

  describe("UPDATE /task/:id", () => {
    it("should return an error when task is not found", async () => {
      const irrID = 1000;
      await createTask("Hello");

      const response = await request(app).put(`/task/${irrID}`);
      expect(response.status).to.equal(STATUS_CODES.NOT_FOUND);
      expect(response.body).to.have.property("error", "Task not found");
    });

    it("should update specified task", async () => {
      const task = await createTask("Complete the documentation");

      const response = await request(app)
        .put(`/task/${task.body.id}`)
        .send({ title: "changed" });

      expect(response.status).to.equal(STATUS_CODES.OK);
      expect(response.body).to.have.property("title", "changed");
      expect(response.body).to.have.all.keys("id", "title", "completed");
      expect(response.body.id).to.equal(task.body.id);
    });
  });

  describe("DELETE /task/:id", async () => {
    it("should return an error when taskID is not found", async () => {
      const irrId = 1000;
      await request(app).post("/task").send({ title: "Complete the test project" });

      const response = await request(app).delete(`/task/${irrId}`);
      expect(response.status).to.equal(STATUS_CODES.NOT_FOUND);
      expect(response.body).to.have.property("error", "Task not found");
    });

    it("should delete specified task", async () => {
      const task = await request(app).post("/task").send({ title: "Complete the build" });
      const response = await request(app).delete(`/task/${task.body.id}`);
      expect(response.status).to.equal(STATUS_CODES.NO_CONTENT);
      expect(response.text).to.be.empty;
    });
  });
});
