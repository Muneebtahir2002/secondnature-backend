import prisma from "../../utils/prisma-client";
import { Request, Response } from "express";

export const getAllCommonForms = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const page = Math.max(Number(req.query.page) || 1, 1);
  const limit = Math.max(Number(req.query.limit) || 10, 1);
  const search = String(req.query.search || "").trim();

  const skip = (page - 1) * limit;

  try {
    const where = search
      ? {
        OR: [
          { name: { contains: search } },
          { email: { contains: search } },
          { contact: { contains: search } },
          { inquiry: { contains: search } },
          { message: { contains: search } },
        ],
      }
      : {};

    const [forms, total] = await Promise.all([
      prisma.commonForm.findMany({
        where,
        skip,
        take: limit,
        orderBy: {
          id: "desc",
        },
        select: {
          id: true,
          email: true,
          name: true,
          contact: true,
          inquiry: true,
          message: true,
        },
      }),
      prisma.commonForm.count({ where }),
    ]);

    const totalPages = Math.ceil(total / limit);

    res.status(200).json({
      messages: [
        { type: "success", message: "Common forms fetched successfully." },
      ],
      data: {
        forms,
        pagination: {
          page,
          limit,
          total,
          totalPages,
          hasNextPage: page < totalPages,
          hasPrevPage: page > 1,
        },
        filters: {
          search,
        },
      },
    });
  } catch (error: any) {
    console.error("Error fetching common forms:", error);

    res.status(500).json({
      messages: [{ type: "error", message: "Could not fetch common forms." }],
      data: null,
    });
  }
};