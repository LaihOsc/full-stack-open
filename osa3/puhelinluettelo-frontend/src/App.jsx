import { useEffect, useState } from "react";
import personService from "./personService";
import "./app.css";
import Notification from "./Notification";

const App = () => {
  const [persons, setPersons] = useState([]);
  const [newName, setNewName] = useState("");
  const [newNumber, setNewNumber] = useState("");
  const [search, setSearch] = useState("");
  const [errorMessage, setErrorMessage] = useState(null);

  useEffect(() => {
    personService.getAll().then((response) => {
      console.log(response.data);
      setPersons(response.data);
    });
  }, []);

  function handleSubmit(event) {
    event.preventDefault();

    if (persons.some((person) => person.name === newName)) {
      alert(`${newName} is already added to phonebook`);
      return;
    }

    setPersons((prev) => [...prev, { name: newName, number: newNumber }]);

    personService
      .create({ name: newName, number: newNumber })
      .then((response) => {
        setPersons((prev) => [...prev, response.data]);
        setErrorMessage(`Added ${newName}`);
        setTimeout(() => {
          setErrorMessage(null);
        }, 5000);
      });

    setNewName("");
    setNewNumber("");
  }

  const filteredPeople = persons.filter((person) =>
    person.name.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div>
      <h2>Phonebook</h2>
      <Notification message={errorMessage} />
      <Filter search={search} setSearch={setSearch} />
      <h3>Add a new</h3>
      <PersonForm
        newName={newName}
        setNewName={setNewName}
        newNumber={newNumber}
        setNewNumber={setNewNumber}
        handleSubmit={handleSubmit}
      />
      <h3>Numbers</h3>
      <Persons
        persons={filteredPeople}
        setPersons={setPersons}
        setErrorMessage={setErrorMessage}
      />
    </div>
  );
};

function Filter({ search, setSearch }) {
  return (
    <div>
      filter shown with:{" "}
      <input value={search} onChange={(e) => setSearch(e.target.value)} />
    </div>
  );
}

function PersonForm({
  newName,
  setNewName,
  newNumber,
  setNewNumber,
  handleSubmit,
}) {
  return (
    <form onSubmit={handleSubmit}>
      <div>
        name:{" "}
        <input value={newName} onChange={(e) => setNewName(e.target.value)} />
      </div>
      <div>
        number:{" "}
        <input
          value={newNumber}
          onChange={(e) => setNewNumber(e.target.value)}
        />
      </div>
      <div>
        <button type="submit">add</button>
      </div>
    </form>
  );
}

function Persons({ persons, setPersons, setErrorMessage }) {
  return (
    <div>
      {persons.map((person) => (
        <p key={person.id}>
          {person.name} {person.number}{" "}
          <button
            onClick={() => {
              if (
                window.confirm(
                  `Are you sure you want to delete ${person.name}?`,
                )
              ) {
                personService.remove(person.id);
                setPersons((prev) => prev.filter((p) => p.id != person.id));
                setErrorMessage(`Deleted ${person.name}`);
                setTimeout(() => {
                  setErrorMessage(null);
                }, 5000);
              }
            }}
          >
            delete
          </button>
        </p>
      ))}
    </div>
  );
}

export default App;
