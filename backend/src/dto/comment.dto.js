function toCommentResponse(c) { return { id: c.id, resourceId: c.resourceId, userId: c.userId, text: c.text, createdAt: c.createdAt }; }
module.exports = { toCommentResponse };
