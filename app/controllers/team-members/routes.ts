// import { createUsers } from "./createUsers";
import { Router } from "express";
// import { getAllUsers } from "./getAllUsers";
// import { getUserById } from "./getUserById";
// import { updateUser } from "./updateUser";

import { createTeamMember } from "./createTeamMember";
import { getAllTeamMembers } from "./getAllTeamMembers";
import { updateTeamMember } from "./updateTeamMember";
import { getTeamMemberById } from "./getTeamMemberById";
import { deleteTeamMember } from "./deleteTeamMember";
// import { deleteUser } from "./deleteUser";
const router = Router();
router.post("/", createTeamMember);
router.get("/", getAllTeamMembers);
router.get("/:id", getTeamMemberById);
router.put("/:id", updateTeamMember);
router.delete("/:id", deleteTeamMember);

export default router;
