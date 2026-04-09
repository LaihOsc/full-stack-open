const express = require("express");
const morgan = require("morgan");
const app = express();
const cors = require("cors");

app.use(cors());

app.use(express.json());
app.use(morgan("tiny"));
app.use(express.static("dist"));

let persons = [
  {
    id: "1",
    name: "Arto Hellas",
    number: "040-123456",
  },
  {
    id: "2",
    name: "Ada Lovelace",
    number: "39-44-5323523",
  },
  {
    id: "3",
    name: "Dan Abramov",
    number: "12-43-234345",
  },
  {
    id: "4",
    name: "Mary Poppendieck",
    number: "39-23-6423122",
  },
];

app.get("/", (request, response) => {
  response.send("<h1>Hello World!</h1>");
});

app.get("/info", (request, response) => {
  response.send(
    `Phonebook has info for ${persons.length} people<br><br>${new Date()}`,
  );
});

app.get("/api/persons", (request, response) => {
  response.json(persons);
});

app.get("/api/persons/:id", (request, response) => {
  const id = request.params.id;
  const person = persons.find((p) => p.id === id);

  if (person) {
    response.json(person);
  } else {
    response.status(404);
  }
});

app.post("/api/persons", (request, response) => {
  console.log(request.body);
  const body = request.body;

  if (!body.name || !body.number) {
    return response.status(400).json({ error: "name or number missing" });
  }

  if (persons.find((p) => p.name === body.name)) {
    return response.status(400).json({ error: "name must be unique" });
  }

  const newPerson = {
    id: Math.random() * 10000,
    name: body.name,
    number: body.number,
  };
  persons = persons.concat(newPerson);

  response.json(body);
});

app.delete("/api/persons/:id", (request, response) => {
  const id = request.params.id;
  persons = persons.filter((p) => p.id !== id);
  response.status(204).end();
});

const PORT = 3001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
