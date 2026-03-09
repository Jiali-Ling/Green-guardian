import { useState } from "react";
import { Send, Heart, Trash2, User } from "lucide-react";
import "../styles/CommentSection.css";

export default function CommentSection({ observationId, comments = [], currentUserId, onAddComment, onDeleteComment, onLikeComment }) {
  const [newComment, setNewComment] = useState("");
  const [replyingTo, setReplyingTo] = useState(null);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    onAddComment({
      id: Date.now().toString(),
      observationId,
      userId: currentUserId,
      text: newComment,
      createdAt: Date.now(),
      likes: 0,
      parentId: replyingTo,
    });

    setNewComment("");
    setReplyingTo(null);
  };

  const rootComments = comments.filter((c) => !c.parentId);

  return (
    <div className="comment-section">
      <h3 className="comment-header">
        Comments ({comments.length})
      </h3>

      <form className="comment-form" onSubmit={handleSubmit}>
        <div className="comment-input-wrapper">
          <User className="user-icon" size={20} />
          <input
            type="text"
            placeholder={replyingTo ? "Write a reply..." : "Add a comment..."}
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            className="comment-input"
          />
          <button
            type="submit"
            className="send-btn"
            disabled={!newComment.trim()}
            aria-label="Send comment"
          >
            <Send size={20} />
          </button>
        </div>
        {replyingTo && (
          <div className="reply-indicator">
            Replying to comment
            <button type="button" onClick={() => setReplyingTo(null)}>Cancel</button>
          </div>
        )}
      </form>

      <div className="comments-list">
        {rootComments.length === 0 ? (
          <p className="no-comments">No comments yet. Be the first to comment!</p>
        ) : (
          rootComments.map((comment) => (
            <CommentItem
              key={comment.id}
              comment={comment}
              currentUserId={currentUserId}
              onReply={() => setReplyingTo(comment.id)}
              onDelete={() => onDeleteComment(comment.id)}
              onLike={() => onLikeComment(comment.id)}
              replies={comments.filter((c) => c.parentId === comment.id)}
            />
          ))
        )}
      </div>
    </div>
  );
}

function CommentItem({ comment, currentUserId, onReply, onDelete, onLike, replies }) {
  const [liked, setLiked] = useState(false);
  const isOwner = comment.userId === currentUserId;

  const handleLike = () => {
    setLiked(!liked);
    onLike();
  };

  return (
    <div className="comment-item">
      <div className="comment-avatar">
        <User size={20} />
      </div>
      
      <div className="comment-content">
        <div className="comment-header-row">
          <span className="comment-user">User {comment.userId?.slice(0, 6)}</span>
          <span className="comment-time">
            {new Date(comment.createdAt).toLocaleDateString()}
          </span>
        </div>
        
        <p className="comment-text">{comment.text}</p>
        
        <div className="comment-actions">
          <button className={`action-btn ${liked ? "liked" : ""}`} onClick={handleLike}>
            <Heart size={14} fill={liked ? "currentColor" : "none"} />
            <span>{(comment.likes || 0) + (liked ? 1 : 0)}</span>
          </button>
          <button className="action-btn" onClick={onReply}>
            Reply
          </button>
          {isOwner && (
            <button className="action-btn delete-btn" onClick={onDelete}>
              <Trash2 size={14} />
            </button>
          )}
        </div>

        {replies && replies.length > 0 && (
          <div className="replies">
            {replies.map((reply) => (
              <CommentItem
                key={reply.id}
                comment={reply}
                currentUserId={currentUserId}
                onReply={onReply}
                onDelete={onDelete}
                onLike={onLike}
                replies={[]}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
