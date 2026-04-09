function Header({ courseName }) {
  return <h1>{courseName}</h1>;
}

function Content({ parts }) {
  return (
    <div>
      {parts.map((part, index) => (
        <Part key={index} part={part.name} exercises={part.exercises} />
      ))}
    </div>
  );
}

function Total({ parts }) {
  const total = parts.reduce((sum, part) => sum + part.exercises, 0);
  return <p>total of {total} exercises</p>;
}

function Part({ part, exercises }) {
  return (
    <p>
      {part} {exercises}
    </p>
  );
}

export function Course({ course }) {
  return (
    <div>
      <Header courseName={course.name} />
      <Content parts={course.parts} />
      <Total parts={course.parts} />
    </div>
  );
}
