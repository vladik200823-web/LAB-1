const s = require("../services/user.service");
const { toUserResponse } = require("../dto/user.dto");
const AppError = require("../middleware/AppError");
function parseId(p) { const id = parseInt(p,10); if(isNaN(id)||id<1) throw new AppError(400,"INVALID_PARAM",'"id" must be a positive integer'); return id; }
const getAll = (req,res) => res.json(s.getAll().map(toUserResponse));
const getById = (req,res) => res.json(toUserResponse(s.getById(parseId(req.params.id))));
const create = (req,res) => res.status(201).json(toUserResponse(s.create(req.body)));
const update = (req,res) => res.json(toUserResponse(s.update(parseId(req.params.id),req.body)));
const remove = (req,res) => { s.remove(parseId(req.params.id)); res.status(204).end(); };
module.exports = { getAll, getById, create, update, remove };
