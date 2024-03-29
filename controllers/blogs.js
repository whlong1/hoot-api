import { Profile } from "../models/profile.js"
import { Blog } from "../models/blog.js"

const create = async (req, res) => {
  try {
    req.body.author = req.user.profile
    const blog = await Blog.create(req.body)
    const profile = await Profile.findByIdAndUpdate(
      req.user.profile,
      { $push: { blogs: blog } },
      { new: true }
    )
    blog.author = profile
    res.status(201).json(blog)
  } catch (err) {
    console.log(err)
    res.status(500).json(err)
  }
}

const index = async (req, res) => {
  try {
    const blogs = await Blog.find({})
      .sort({ createdAt: 'desc' })
      .populate('author', 'name photo')
      .select('title text createdAt category author')
    res.status(200).json(blogs)
  } catch (err) {
    res.status(500).json(err)
  }
}

const show = async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id)
      .populate('author', 'name photo')
      .populate('comments.author', 'name photo')
    res.status(200).json(blog)
  } catch (err) {
    return res.status(500).json(err)
  }
}

const update = async (req, res) => {
  try {
    const blog = await Blog.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    ).populate('author')

    res.status(200).json(blog)
  } catch (err) {
    res.status(500).json(err)
  }
}

const deleteBlog = async (req, res) => {
  try {
    const blog = await Blog.findByIdAndDelete(req.params.id)
    const profile = await Profile.findById(req.user.profile)
    profile.blogs.remove({ _id: req.params.id })
    await profile.save()
    res.status(200).json(blog)
  } catch (err) {
    res.status(500).json(err)
  }
}

const createComment = async (req, res) => {
  try {
    req.body.author = req.user.profile
    const blog = await Blog.findById(req.params.id)
    blog.comments.push(req.body)
    await blog.save()
    const newComment = blog.comments[blog.comments.length - 1]
    const profile = await Profile.findById(req.user.profile)
    newComment.author = profile
    res.status(201).json(newComment)
  } catch (err) {
    res.status(500).json(err)
  }
}

const updateComment = async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.blogId)
    const comment = blog.comments.id(req.params.commentId)
    comment.text = req.body.text
    await blog.save()
    res.status(200).json(blog)
  } catch (err) {
    res.status(500).json(err)
  }
}

const deleteComment = async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.blogId)
    blog.comments.remove({ _id: req.params.commentId })
    await blog.save()
    res.status(200).json(blog)
  } catch (err) {
    res.status(500).json(err)
  }
}

const addLike = async (req, res) => {
  try {
    await Promise.all([
      Blog.findByIdAndUpdate(
        req.params.id,
        { $push: { likes: req.user.profile } },
      ),
      Profile.findByIdAndUpdate(
        req.user.profile,
        { $push: { likedBlogs: req.params.id } },
      )
    ])
    res.status(201).json({ msg: 'OK' })
  } catch (error) {
    res.status(500).json(error)
  }
}

const removeLike = async (req, res) => {
  try {
    await Promise.all([
      Blog.findByIdAndUpdate(
        req.params.id,
        { $pull: { likes: req.user.profile } },
      ),
      Profile.findByIdAndUpdate(
        req.user.profile,
        { $pull: { likedBlogs: req.params.id } },
      )
    ])
    res.status(200).json({ msg: 'OK' })
  } catch (error) {
    res.status(500).json(error)
  }
}

export {
  createComment,
  updateComment,
  deleteComment,
  create,
  index,
  show,
  update,
  deleteBlog as delete,
  addLike,
  removeLike,
}