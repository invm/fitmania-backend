import { Request, Response, NextFunction } from 'express';
import CommentsDBService from '../services/Comment';
import PostsDBService from '../services/Posts';

// @desc     Gets comment for specific post
// @route    GET /api/posts/:id/comments
// @access   Public

const getComments = async (req: Request) => {
  return { data: await CommentsDBService.getComments(req.params.id) };
};

// @desc     Creates a comment for specific post
// @route    POST /api/posts/:id/comments
// @access   Private

const createComment = async (req: Request) => {
  let comment = await CommentsDBService.createComment({
    post: req.params.id,
    user: req.user._id,
    text: req.body.text,
  });

  await PostsDBService.addComment(req.params.id, comment._id);

  return { data: comment };
};

// @desc     Edits a comment for specific post
// @route    PUT /api/posts/:id/comments/:commentId
// @access   Private

const editComment = async (req: Request) => {
  // TODO: add validator
  await CommentsDBService.updateComment(req.params.commentId, { text: req.body.text });
};

// @desc     Removes a comment from specific post
// @route    DELETE /api/posts/:id/comments
// @access   Private

const removeComment = async (req: Request) => {
  // TODO: add validator
  await CommentsDBService.deleteComment(req.params.commentId);
  await PostsDBService.removeComment(req.params.id, req.params.commentId);
};

export default { getComments, createComment, removeComment, editComment };
