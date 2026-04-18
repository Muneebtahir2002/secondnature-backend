import prisma from "../../utils/prisma-client";
import { Request, Response } from "express";

export const deleteTeamMember = async (
    req: Request,
    res: Response,
): Promise<void> => {
    try {
        const id = Number(req.params.id);

        if (!id || Number.isNaN(id)) {
            res.status(400).json({
                messages: [{ type: "error", message: "Valid team member id is required." }],
                data: null,
            });
            return;
        }

        const existingTeamMember = await prisma.teamMember.findUnique({
            where: { id },
            select: {
                id: true,
                fullName: true,
                pictureUrl: true,
            },
        });

        if (!existingTeamMember) {
            res.status(404).json({
                messages: [{ type: "error", message: "Team member not found." }],
                data: null,
            });
            return;
        }

        await prisma.teamMember.delete({
            where: { id },
        });

        res.status(200).json({
            messages: [
                { type: "success", message: "Team member deleted successfully." },
            ],
            data: existingTeamMember,
        });
    } catch (error: any) {
        console.error("Error deleting team member:", error);

        res.status(500).json({
            messages: [{ type: "error", message: "Could not delete team member." }],
            data: null,
        });
    }
};