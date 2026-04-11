const blogsRouter = require("express").Router();
const Blog = require("../models/blog");
const User = require("../models/user");
const jwt = require("jsonwebtoken");

const getTokenFrom = (request) => {
  const authorization = request.get("authorization");
  if (authorization && authorization.startsWith("Bearer ")) {
    return authorization.replace("Bearer ", "");
  }
  return null;
};

blogsRouter.get("/", async (request, response) => {
  const blogs = await Blog.find({}).populate("user", { name: 1, username: 1 });
  response.json(blogs);
});

blogsRouter.post("/", async (request, response) => {
  const { title, author, url, likes } = request.body;
  const decodedToken = jwt.verify(getTokenFrom(request), process.env.SECRET);
  if (!decodedToken.id) {
    return response.status(401).json({ error: "token invalid" });
  }
  const user = await User.findById(decodedToken.id);

  if (!user) {
    return response.status(400).json({ error: "UserId missing or not valid" });
  }

  const blog = new Blog({
    title,
    author,
    url,
    likes,
    user: user.id,
  });

  const newBlog = await blog.save();
  user.blogs = user.blogs.concat(newBlog._id);
  await user.save();

  response.status(201).json(newBlog);
});

blogsRouter.put("/:id", async (request, response) => {
  const id = request.params.id;
  const { title, author, url, likes } = request.body;

  const updatedBlog = await Blog.findByIdAndUpdate(id, {
    title,
    author,
    url,
    likes,
  });

  response.status(201).json(updatedBlog);
});

blogsRouter.delete("/:id", async (request, response) => {
  const id = request.params.id;

  try {
    const res = await Blog.findByIdAndDelete(id);

    if (!res) {
      return response.status(404).json({ error: "not found" });
    }

    response.status(204).end();
  } catch (e) {
    response.status(400).json({ error: "invalid id format" });
  }
});

module.exports = blogsRouter;
