import { Router } from "express";
import { createPoster } from "./createPoster";
import { getPoster } from "./getPoster";
import { updatePoster } from "./updatePoster";
// import { deleteUser } from "./deleteUser";
const router = Router();
router.post("/", createPoster);
router.get("/", getPoster);
router.put("/:id", updatePoster);

export default router;
