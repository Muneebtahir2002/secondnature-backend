import prisma from "../../utils/prisma-client";
import { Request, Response } from "express";

export const getTeamMemberById = async (
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

        const teamMember = await prisma.teamMember.findUnique({
            where: { id },
            select: {
                id: true,
                fullName: true,
                degree: true,
                designation: true,
                category: true,
                description: true,
                pictureUrl: true,
                educationPosition: true,
                clinicalPosition: true,
                createdAt: true,
                updatedAt: true,
            },
        });

        if (!teamMember) {
            res.status(404).json({
                messages: [{ type: "error", message: "Team member not found." }],
                data: null,
            });
            return;
        }

        res.status(200).json({
            messages: [
                { type: "success", message: "Team member fetched successfully." },
            ],
            data: teamMember,
        });
    } catch (error: any) {
        console.error("Error fetching team member:", error);

        res.status(500).json({
            messages: [{ type: "error", message: "Could not fetch team member." }],
            data: null,
        });
    }
};