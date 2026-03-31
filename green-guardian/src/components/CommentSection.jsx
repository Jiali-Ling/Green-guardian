import { useMemo, useState } from "react";
import { Send, Heart, Trash2, User } from "lucide-react";
import "../styles/CommentSection.css";

export default function CommentSection({ observationId, comments = [], currentUserId, onAddComment, onDeleteComment, onLikeComment }) {
  const [newComment, setNewComment] = useState("");
  const [replyingTo, setReplyingTo] = useState(null);

  const rootComments = useMemo(
    () => comments.filter((comment) => !comment.parentId),
    [comments]
  );

  const repliesByParentId = useMemo(() => {
    return comments.reduce((acc, comment) => {
      if (!comment.parentId) return acc;
      if (!acc[comment.parentId]) {
        acc[comment.parentId] = [];
      }
      acc[comment.parentId].push(comment);
      return acc;
    }, {});
  }, [comments]);

  function handleSubmit(e) {
    e.preventDefault();
    if (!newComment.trim()) return;

    onAddComment(observationId, newComment.trim(), replyingTo);

    setNewComment("");
    setReplyingTo(null);
  }

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
              observationId={observationId}
              comment={comment}
              currentUserId={currentUserId}
              setReplyingTo={setReplyingTo}
              onDeleteComment={onDeleteComment}
              onLikeComment={onLikeComment}
              repliesByParentId={repliesByParentId}
            />
          ))
        )}
      </div>
    </div>
  );
}

function CommentItem({
  observationId,
  comment,
  currentUserId,
  setReplyingTo,
  onDeleteComment,
  onLikeComment,
  repliesByParentId,
}) {
  const [hasLiked, setHasLiked] = useState(false);
  const isOwner = comment.userId === currentUserId;
  const replies = repliesByParentId[comment.id] || [];
  const displayName = comment.username || `User ${comment.userId?.slice(0, 6) || "anon"}`;

  function handleLike() {
    if (hasLiked) return;
    onLikeComment(observationId, comment.id);
    setHasLiked(true);
  }

  function handleDelete() {
    onDeleteComment(observationId, comment.id);
  }

  return (
    <div className="comment-item">
      <div className="comment-avatar">
        <User size={20} />
      </div>

      <div className="comment-content">
        <div className="comment-header-row">
          <span className="comment-user">{displayName}</span>
          <span className="comment-time">
            {new Date(comment.createdAt).toLocaleDateString()}
          </span>
        </div>

        <p className="comment-text">{comment.text}</p>

        <div className="comment-actions">
          <button
            type="button"
            className={`action-btn ${hasLiked ? "liked" : ""}`}
            onClick={handleLike}
          >
            <Heart size={14} fill={hasLiked ? "currentColor" : "none"} />
            <span>{comment.likes || 0}</span>
          </button>

          <button
            type="button"
            className="action-btn"
            onClick={() => setReplyingTo(comment.id)}
          >
            Reply
          </button>

          {isOwner && (
            <button
              type="button"
              className="action-btn delete-btn"
              onClick={handleDelete}
            >
              <Trash2 size={14} />
            </button>
          )}
        </div>

        {replies.length > 0 && (
          <div className="replies">
            {replies.map((reply) => (
              <CommentItem
                key={reply.id}
                observationId={observationId}
                comment={reply}
                currentUserId={currentUserId}
                setReplyingTo={setReplyingTo}
                onDeleteComment={onDeleteComment}
                onLikeComment={onLikeComment}
                repliesByParentId={repliesByParentId}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
