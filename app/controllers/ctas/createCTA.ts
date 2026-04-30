import prisma from "../../utils/prisma-client";
import { Request, Response } from "express";

export const createCTA = async (req: Request, res: Response): Promise<void> => {
  const { heading, paragraph, buttonText, buttonHref, isActive } = req.body;

  const safeHeading =
    typeof heading === "string" && heading.trim() !== ""
      ? heading.trim()
      : null;

  const safeParagraph =
    typeof paragraph === "string" && paragraph.trim() !== ""
      ? paragraph.trim()
      : null;

  const safeButtonText =
    typeof buttonText === "string" && buttonText.trim() !== ""
      ? buttonText.trim()
      : null;

  const safeButtonHref =
    typeof buttonHref === "string" && buttonHref.trim() !== ""
      ? buttonHref.trim()
      : null;

  if (safeButtonText && !safeButtonHref) {
    res.status(400).json({
      messages: [
        {
          type: "error",
          message: "Please provide button href when button text is given.",
        },
      ],
      data: null,
    });
    return;
  }

  if (safeButtonHref && !safeButtonText) {
    res.status(400).json({
      messages: [
        {
          type: "error",
          message: "Please provide button text when button href is given.",
        },
      ],
      data: null,
    });
    return;
  }

  let imageUrl: string | null = null;

  if (req.file) {
    imageUrl = `${process.env.ADMIN_APP_URI}/images/${req.file.filename}`;
  }

  const hasAnyCTAContent =
    safeHeading || safeParagraph || imageUrl || (safeButtonText && safeButtonHref);

  if (!hasAnyCTAContent) {
    res.status(400).json({
      messages: [
        {
          type: "error",
          message: "Please provide at least one CTA field.",
        },
      ],
      data: null,
    });
    return;
  }

  try {
    const newCTA = await prisma.cTA.create({
      data: {
        imageUrl,
        heading: safeHeading,
        paragraph: safeParagraph,
        buttonText: safeButtonText,
        buttonHref: safeButtonHref,
        isActive: typeof isActive === "boolean" ? isActive : true,
      },
      select: {
        id: true,
        imageUrl: true,
        heading: true,
        paragraph: true,
        buttonText: true,
        buttonHref: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    res.status(201).json({
      messages: [{ type: "success", message: "CTA created successfully." }],
      data: { cta: newCTA },
    });
  } catch (error: any) {
    console.error("Error creating CTA:", error);

    res.status(500).json({
      messages: [{ type: "error", message: "Could not create CTA." }],
      data: null,
    });
  }
};