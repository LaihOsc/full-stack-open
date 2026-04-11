const { test, after, beforeEach } = require("node:test");
const mongoose = require("mongoose");
const supertest = require("supertest");
const app = require("../app");
const Blog = require("../models/blog");
const assert = require("node:assert");

const api = supertest(app);

const initialBlogs = [
  {
    _id: "5a422a851b54a676234d17f7",
    title: "React patterns",
    author: "Michael Chan",
    url: "https://reactpatterns.com/",
    likes: 7,
    __v: 0,
  },
  {
    _id: "5a422aa71b54a676234d17f8",
    title: "Go To Statement Considered Harmful",
    author: "Edsger W. Dijkstra",
    url: "http://www.u.arizona.edu/~rubinson/copyright_violations/Go_To_Considered_Harmful.html",
    likes: 5,
    __v: 0,
  },
  {
    _id: "5a422b3a1b54a676234d17f9",
    title: "Canonical string reduction",
    author: "Edsger W. Dijkstra",
    url: "http://www.cs.utexas.edu/~EWD/transcriptions/EWD08xx/EWD808.html",
    likes: 12,
    __v: 0,
  },
  {
    _id: "5a422b891b54a676234d17fa",
    title: "First class tests",
    author: "Robert C. Martin",
    url: "http://blog.cleancoder.com/uncle-bob/2017/05/05/TestDefinitions.htmll",
    likes: 10,
    __v: 0,
  },
  {
    _id: "5a422ba71b54a676234d17fb",
    title: "TDD harms architecture",
    author: "Robert C. Martin",
    url: "http://blog.cleancoder.com/uncle-bob/2017/03/03/TDD-Harms-Architecture.html",
    likes: 0,
    __v: 0,
  },
  {
    _id: "5a422bc61b54a676234d17fc",
    title: "Type wars",
    author: "Robert C. Martin",
    url: "http://blog.cleancoder.com/uncle-bob/2016/05/01/TypeWars.html",
    likes: 2,
    __v: 0,
  },
];

beforeEach(async () => {
  await Blog.deleteMany({});
  let blogObject = new Blog(initialBlogs[0]);
  await blogObject.save();
  blogObject = new Blog(initialBlogs[1]);
  await blogObject.save();
  blogObject = new Blog(initialBlogs[2]);
  await blogObject.save();
  blogObject = new Blog(initialBlogs[3]);
  await blogObject.save();
  blogObject = new Blog(initialBlogs[4]);
  await blogObject.save();
  blogObject = new Blog(initialBlogs[5]);
  await blogObject.save();
});

test("blogs are returned as json", async () => {
  await api
    .get("/api/blogs")
    .expect(200)
    .expect("Content-Type", /application\/json/);
});

test("returns the correct amount of blogs", async () => {
  await api.get("/api/blogs").expect(200);

  const res = await api.get("/api/blogs");
  assert.strictEqual(res.body.length, initialBlogs.length);
});

test("unique identifier property of the blog posts is named id", async () => {
  const res = await api.get("/api/blogs");

  const identifierIsIDInAllBlogs = res.body.every((blog) => blog.id);
  assert(identifierIsIDInAllBlogs);
});

test("new blog post can be added by post request", async () => {
  const sampleBlog = {
    title: "test",
    author: "tester",
    url: "test.fi",
  };
  const blog = new Blog(sampleBlog);

  const newBlog = await blog.save();

  const res = await api.get("/api/blogs");
  assert(res.body.length === initialBlogs.length + 1);
  assert(newBlog.title === sampleBlog.title);
  assert(newBlog.author === sampleBlog.author);
  assert(newBlog.url === sampleBlog.url);
});

test("a blog post can be deleted", async () => {
  const blogsAtStart = await api.get("/api/blogs");

  const lastBlogPost = blogsAtStart.body[blogsAtStart.body.length - 1];

  await api.delete(`/api/blogs/${lastBlogPost.id}`);

  const blogsAtEnd = await api.get("/api/blogs");

  const deletedBlogExists = blogsAtEnd.body.some((b) => b.id == lastBlogPost);

  assert.strictEqual(blogsAtEnd.body.length, blogsAtStart.body.length - 1);
  assert.strictEqual(deletedBlogExists, false);
});

test.only("a blog post can be updated", async () => {
  const id = initialBlogs[0]._id;
  const blogAtStart = (await api.get("/api/blogs")).body.find(
    (b) => b.id == id,
  );

  const updatedBlog = {
    ...blogAtStart,
    title: `${blogAtStart.title}x`,
    author: `${blogAtStart.author}x`,
    url: `${blogAtStart.url}x`,
    likes: blogAtStart.likes + 1,
  };

  await api.put(`/api/blogs/${id}`).send(updatedBlog);

  const blogAtEnd = (await api.get("/api/blogs")).body.find((b) => b.id == id);

  assert(blogAtStart.title != blogAtEnd.title);
  assert(blogAtStart.author != blogAtEnd.author);
  assert(blogAtStart.url != blogAtEnd.url);
  assert(blogAtStart.likes != blogAtEnd.likes);
});

after(async () => {
  await mongoose.connection.close();
});
