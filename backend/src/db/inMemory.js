const db = {
  users: [
    { id: 1, name: "Олена Коваль", email: "olena@example.com", role: "admin", createdAt: "2024-01-10T10:00:00.000Z" },
    { id: 2, name: "Михайло Бондар", email: "mykhailo@example.com", role: "user", createdAt: "2024-02-15T12:30:00.000Z" }
  ],
  resources: [
    { id: 1, title: "CS50 by Harvard", url: "https://cs50.harvard.edu", category: "programming", description: "Один з найкращих вступних курсів з CS", authorId: 1, createdAt: "2024-03-01T09:00:00.000Z" },
    { id: 2, title: "The Odin Project", url: "https://www.theodinproject.com", category: "programming", description: "Безкоштовний курс з веб-розробки", authorId: 2, createdAt: "2024-03-05T11:00:00.000Z" }
  ],
  ratings: [
    { id: 1, resourceId: 1, userId: 2, value: 5, createdAt: "2024-03-10T14:00:00.000Z" },
    { id: 2, resourceId: 2, userId: 1, value: 4, createdAt: "2024-03-11T09:00:00.000Z" }
  ],
  comments: [
    { id: 1, resourceId: 1, userId: 2, text: "Чудовий курс!", createdAt: "2024-03-10T15:00:00.000Z" },
    { id: 2, resourceId: 2, userId: 1, text: "Дуже практичний підхід.", createdAt: "2024-03-12T10:00:00.000Z" }
  ],
  _counters: { users: 2, resources: 2, ratings: 2, comments: 2 }
};
function nextId(entity) { db._counters[entity] += 1; return db._counters[entity]; }
module.exports = { db, nextId };
