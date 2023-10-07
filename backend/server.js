import express from "express";
import { database, connectToDb } from "./db.js";
import { ObjectId } from "mongodb";

const app = express();
app.use(express.json());

app.post("/api/character/:id", async (req, res) => {
  const characterId = req.params.id;
  const updatedData = req.body;
  const filter = { _id: new ObjectId(characterId) };
  let update;

  // Verifica si updatedData es un array
  if (Array.isArray(updatedData)) {
    update = { $set: { completed: updatedData } };
  } else {
    // Si es un objeto, actualiza con las propiedades individuales del objeto
    update = { $set: updatedData };
  }

  try {
    const result = await database
      .collection("character")
      .findOneAndUpdate(filter, update);

    if (result !== null) {
      res.status(200).json({ message: "Character updated" });
    }
  } catch (error) {
    res.status(500).json({ message: "Character update failed:", error });
  }
});

app.post("/api/newcharacter", async (req, res) => {
  try {
    const template = {
      level: 0,
      name: "New character",
      race: "race",
      class: "class",
      mainspec: "build",
      gearscore: 0,
      primary: "profession",
      secondary: "profession",
      completed: [],
    };
    const response = await database.collection("character").insertOne(template);
    if (response.acknowledged) {
      const newCharacter = new ObjectId(response.insertedId);
      res.status(201).json({ message: "New character created", newCharacter });
    }
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
});

app.delete("/api/deletecharacter/:id", async (req, res) => {
  const characterId = req.params.id;
  try {
    const filter = { _id: new ObjectId(characterId) };
    const result = await database.collection("character").deleteOne(filter);
    if (result.deletedCount === 1) {
      res.status(201).json({ message: "Character deleted" });
    }
  } catch (error) {
    res.status(500).json({ message: "Server error: ", error });
  }
});

app.delete("/api/deletecharacters", async (req, res) => {
  try {
    const result = await database.collection("character").deleteMany({});
    if (result.deletedCount > 0) {
      res.status(200).json({ message: "All characters deleted" });
    }
  } catch (error) {
    res.status(500).json({ message: "Server error:", error });
  }
});

app.get("/api/character", async (req, res) => {
  try {
    const characters = await database
      .collection("character")
      .find({})
      .toArray();
    res.json(characters);
  } catch (error) {
    res.status(500).send("An error occurred.", error);
  }
});

app.post("/api/task/:id", async (req, res) => {
  const taskId = req.params.id;
  const updatedData = req.body;
  const filter = { _id: new ObjectId(taskId) };
  let update;

  // Verifica si updatedData es un array
  if (Array.isArray(updatedData)) {
    // Si es un array, actualiza directamente el campo arrayField con el array completo
    update = { $set: { exclude: updatedData } }; // Nombre real del campo a actualizar
  } else {
    // Si es un objeto, actualiza con las propiedades individuales del objeto
    update = { $set: updatedData };
  }

  try {
    const result = await database
      .collection("task")
      .findOneAndUpdate(filter, update);
      console.log(result);
    if (result !== null) {
      res.status(201).json({ message: "Task updated" });
    }
  } catch (error) {
    res.status(500).json({ message: "Error: ", error });
  }
});

app.post("/api/newtask", async (req, res) => {
  try {
    const template = {
      task: "Task",
      gearscore: 0,
      profession: "all",
      exclude: [],
    };
    const result = await database.collection("task").insertOne(template);
    if (result.acknowledged) {
      const newTask = new ObjectId(result.insertedId);
      res.status(201).json({ message: "Task created", newTask });
    } 
  } catch (error) {
    res.status(500).json({ message: "Error: ", error });
  }
});

app.delete("/api/deletetask/:id", async (req, res) => {
  const taskId = req.params.id;
  try {
    const filter = { _id: new ObjectId(taskId) };
    const result = await database.collection("task").deleteOne(filter);
    if (result.deletedCount === 1) {
      res.status(201).json({ message: "Task deleted" });
    } 
  } catch (error) {
    res.status(500).json({ message: "Error: ", error });
  }
});

app.delete("/api/deletetasks", async (req, res) => {
  try {
    const result = await database.collection("task").deleteMany({});
    if (result.deletedCount > 0) {
      res
        .status(201)
        .json({ message: "All tasks deleted" });
    } 
  } catch (error) {
    res.status(500).json({ message: "Error: ", error });
  }
});

app.get("/api/task", async (req, res) => {
  try {
    const tasks = await database.collection("task").find({}).toArray();
    res.json(tasks);
  } catch (error) {
    console.error(error);
    res.status(500).send("An error occurred.");
  }
});

connectToDb(() => {
  app.listen(8000, () => {
    console.log("on port 8000");
  });
});
