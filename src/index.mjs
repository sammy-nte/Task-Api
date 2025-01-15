import e from "express";

const app = e();
app.use(e.json());
const PORT = process.env.PORT || 3000;

app.locals.taskArray = [];
app.locals.taskId = 1;

app.post("/task", (req, res) => {
  const { title } = req.body;
  if (!title) return res.status(400).json({ error: "Title is required" });
  const task = {
    id:
      app.locals.taskArray.length > 0
        ? app.locals.taskArray[app.locals.taskArray.length - 1].id + 1
        : app.locals.taskId,
    title,
    completed: false
  };
  app.locals.taskArray.push(task);
  return res.status(201).json(task);
});

app.get("/task", (req, res) => {
  return res.status(200).json(app.locals.taskArray);
});

app.get("/task/:id", (req, res) => {
  const { params: { id } } = req;
  const parsedId = parseInt(id);
  const taskIndex = app.locals.taskArray.findIndex(
    items => items.id === parsedId
  );

  if (taskIndex === -1)
    return res.status(404).json({ error: "Task not found" });
  const foundTask = app.locals.taskArray[taskIndex];
  return res.status(200).send(foundTask);
});

app.put("/task/:id", (req, res) => {
  const { params: { id }, body: { title } } = req;
  const parsedId = parseInt(id);
  const taskIndex = app.locals.taskArray.findIndex(
    items => items.id === parsedId
  );
  if (taskIndex === -1)
    return res.status(404).json({ error: "Task not found" });
  const foundTask = app.locals.taskArray[taskIndex];
  app.locals.taskArray[taskIndex] = {
    ...foundTask,
    title: title
  };
  return res.status(200).json(app.locals.taskArray[taskIndex]);
});

app.delete("/task/:id", (req, res) => {
  const { params: { id } } = req;
  const parsedId = parseInt(id);
  const taskIndex = app.locals.taskArray.findIndex(
    items => items.id === parsedId
  );
  if (taskIndex === -1)
    return res.status(404).json({ error: "Task not found" });
  const foundTask = app.locals.taskArray[taskIndex];
  app.locals.taskArray.slice(foundTask, 1);
  return res.sendStatus(204);
});

app.listen(PORT, () => {
  console.log(`App running on port: ${PORT}`);
});

export default app;
