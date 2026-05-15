function toResourceResponse(r) { return { id: r.id, title: r.title, url: r.url, category: r.category, description: r.description, authorId: r.authorId, createdAt: r.createdAt }; }
module.exports = { toResourceResponse };
