function toUserResponse(u) { return { id: u.id, name: u.name, email: u.email, role: u.role, createdAt: u.createdAt }; }
module.exports = { toUserResponse };
