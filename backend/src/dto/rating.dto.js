function toRatingResponse(r) { return { id: r.id, resourceId: r.resourceId, userId: r.userId, value: r.value, createdAt: r.createdAt }; }
module.exports = { toRatingResponse };
