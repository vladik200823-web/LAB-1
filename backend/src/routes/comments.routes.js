const express = require("express");
const repo = require("../repositories/commentsRepo");
const router = express.Router();
router.get("/", async (req,res,next) => { try { const c=await repo.getAllComments(req.query); res.json({data:c,meta:{count:c.length}}); } catch(e){next(e);} });
router.get("/:id", async (req,res,next) => { try { const id=Number(req.params.id); if(!Number.isFinite(id)) return res.status(400).json({error:"id must be a number"}); const c=await repo.getCommentById(id); if(!c) return res.status(404).json({error:"Comment not found"}); res.json({data:c}); } catch(e){next(e);} });
router.post("/", async (req,res,next) => { try { const {resourceId,userId,text}=req.body; if(!resourceId||!userId||!text) return res.status(400).json({error:"resourceId, userId, text are required"}); const c=await repo.createComment(resourceId,userId,text); res.status(201).json({data:c}); } catch(e){next(e);} });
router.put("/:id", async (req,res,next) => { try { const id=Number(req.params.id); if(!Number.isFinite(id)) return res.status(400).json({error:"id must be a number"}); const {text}=req.body; if(!text) return res.status(400).json({error:"text is required"}); const c=await repo.updateComment(id,text); if(!c) return res.status(404).json({error:"Comment not found"}); res.json({data:c}); } catch(e){next(e);} });
router.delete("/:id", async (req,res,next) => { try { const id=Number(req.params.id); if(!Number.isFinite(id)) return res.status(400).json({error:"id must be a number"}); const ok=await repo.deleteComment(id); if(!ok) return res.status(404).json({error:"Comment not found"}); res.status(204).send(); } catch(e){next(e);} });
module.exports = router;
