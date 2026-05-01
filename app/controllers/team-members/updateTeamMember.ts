import prisma from "../../utils/prisma-client";
import { Request, Response } from "express";
import { TeamMemberCategory } from "@prisma/client";

export const updateTeamMember = async (
    req: Request,
    res: Response
): Promise<void> => {
    try {
        const id = Number(req.params.id);

        if (!id || Number.isNaN(id)) {
            res.status(400).json({
                messages: [
                    { type: "error", message: "Valid team member id is required." },
                ],
                data: null,
            });
            return;
        }

        const existingTeamMember = await prisma.teamMember.findUnique({
            where: { id },
        });

        if (!existingTeamMember) {
            res.status(404).json({
                messages: [{ type: "error", message: "Team member not found." }],
                data: null,
            });
            return;
        }

        const {
            fullName,
            degree,
            designation,
            category,
            description,
            clinicalPosition,
            educationPosition,
        } = req.body;

        let normalizedCategory: TeamMemberCategory | undefined;

        if (
            category !== undefined &&
            category !== null &&
            String(category).trim() !== ""
        ) {
            const formattedCategory = String(category).trim().toUpperCase();

            const allowedCategories = Object.values(TeamMemberCategory);

            if (!allowedCategories.includes(formattedCategory as TeamMemberCategory)) {
                res.status(400).json({
                    messages: [
                        {
                            type: "error",
                            message:
                                "Invalid category. Allowed values are CLINICAL, EDUCATION, BOTH.",
                        },
                    ],
                    data: null,
                });
                return;
            }

            normalizedCategory = formattedCategory as TeamMemberCategory;
        }

        if (fullName !== undefined && String(fullName).trim() === "") {
            res.status(400).json({
                messages: [{ type: "error", message: "Full name cannot be empty." }],
                data: null,
            });
            return;
        }

        const finalCategory = normalizedCategory ?? existingTeamMember.category;

        const normalizedClinicalPosition =
            clinicalPosition !== undefined &&
                clinicalPosition !== null &&
                String(clinicalPosition).trim() !== ""
                ? Number(clinicalPosition)
                : clinicalPosition !== undefined
                    ? null
                    : existingTeamMember.clinicalPosition;

        const normalizedEducationPosition =
            educationPosition !== undefined &&
                educationPosition !== null &&
                String(educationPosition).trim() !== ""
                ? Number(educationPosition)
                : educationPosition !== undefined
                    ? null
                    : existingTeamMember.educationPosition;

        if (
            normalizedClinicalPosition !== null &&
            normalizedClinicalPosition !== undefined &&
            (Number.isNaN(normalizedClinicalPosition) || normalizedClinicalPosition <= 0)
        ) {
            res.status(400).json({
                messages: [{ type: "error", message: "Clinical position must be a valid number." }],
                data: null,
            });
            return;
        }

        if (
            normalizedEducationPosition !== null &&
            normalizedEducationPosition !== undefined &&
            (Number.isNaN(normalizedEducationPosition) || normalizedEducationPosition <= 0)
        ) {
            res.status(400).json({
                messages: [{ type: "error", message: "Education position must be a valid number." }],
                data: null,
            });
            return;
        }

        if (
            finalCategory === TeamMemberCategory.CLINICAL &&
            !normalizedClinicalPosition
        ) {
            res.status(400).json({
                messages: [{ type: "error", message: "Clinical position is required." }],
                data: null,
            });
            return;
        }

        if (
            finalCategory === TeamMemberCategory.EDUCATION &&
            !normalizedEducationPosition
        ) {
            res.status(400).json({
                messages: [{ type: "error", message: "Education position is required." }],
                data: null,
            });
            return;
        }

        if (
            finalCategory === TeamMemberCategory.BOTH &&
            (!normalizedClinicalPosition || !normalizedEducationPosition)
        ) {
            res.status(400).json({
                messages: [
                    {
                        type: "error",
                        message: "Clinical position and education position are required.",
                    },
                ],
                data: null,
            });
            return;
        }

        if (normalizedClinicalPosition) {
            const existingClinicalPosition = await prisma.teamMember.findFirst({
                where: {
                    clinicalPosition: normalizedClinicalPosition,
                    id: {
                        not: id,
                    },
                },
            });

            if (existingClinicalPosition) {
                res.status(400).json({
                    messages: [
                        {
                            type: "error",
                            message:
                                "This clinical position is already assigned to another team member.",
                        },
                    ],
                    data: null,
                });
                return;
            }
        }

        if (normalizedEducationPosition) {
            const existingEducationPosition = await prisma.teamMember.findFirst({
                where: {
                    educationPosition: normalizedEducationPosition,
                    id: {
                        not: id,
                    },
                },
            });

            if (existingEducationPosition) {
                res.status(400).json({
                    messages: [
                        {
                            type: "error",
                            message:
                                "This education position is already assigned to another team member.",
                        },
                    ],
                    data: null,
                });
                return;
            }
        }

        let pictureUrl = existingTeamMember.pictureUrl;

        if (req.file) {
            pictureUrl = `${process.env.ADMIN_APP_URI}/images/${req.file.filename}`;
        }

        const updatedTeamMember = await prisma.teamMember.update({
            where: { id },
            data: {
                fullName:
                    fullName !== undefined
                        ? String(fullName).trim()
                        : existingTeamMember.fullName,

                degree:
                    degree !== undefined
                        ? String(degree).trim() || null
                        : existingTeamMember.degree,

                designation:
                    designation !== undefined
                        ? String(designation).trim() || null
                        : existingTeamMember.designation,

                category: finalCategory,

                description:
                    description !== undefined
                        ? String(description).trim() || null
                        : existingTeamMember.description,

                pictureUrl,

                clinicalPosition: normalizedClinicalPosition,
                educationPosition: normalizedEducationPosition,
            },
        });

        res.status(200).json({
            messages: [
                { type: "success", message: "Team member updated successfully." },
            ],
            data: updatedTeamMember,
        });
    } catch (error: any) {
        console.error("Error updating team member:", error);

        res.status(500).json({
            messages: [{ type: "error", message: "Could not update team member." }],
            data: null,
        });
    }
};