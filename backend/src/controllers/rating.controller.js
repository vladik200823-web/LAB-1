const s = require("../services/rating.service");
const { toRatingResponse } = require("../dto/rating.dto");
const AppError = require("../middleware/AppError");
function parseId(p) { const id = parseInt(p,10); if(isNaN(id)||id<1) throw new AppError(400,"INVALID_PARAM",'"id" must be a positive integer'); return id; }
const getAll = (req,res) => res.json(s.getAll().map(toRatingResponse));
const getById = (req,res) => res.json(toRatingResponse(s.getById(parseId(req.params.id))));
const create = (req,res) => res.status(201).json(toRatingResponse(s.create(req.body)));
const update = (req,res) => res.json(toRatingResponse(s.update(parseId(req.params.id),req.body)));
const remove = (req,res) => { s.remove(parseId(req.params.id)); res.status(204).end(); };
module.exports = { getAll, getById, create, update, remove };
