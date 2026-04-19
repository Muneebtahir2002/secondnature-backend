import prisma from "../../utils/prisma-client";
import { Request, Response } from "express";
import { transporter } from "../../utils/mailer";
import { renderEmailTemplate } from "../../utils/render-email-template";

export const createCommonForm = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const {
    email,
    name,
    enquiry,
    inquiry,
    message,
    firstName,
    lastName,
    contact,
  } = req.body;

  const finalFirstName = firstName?.trim() || "";
  const finalLastName = lastName?.trim() || "";
  const fullName =
    name?.trim() || `${finalFirstName} ${finalLastName}`.trim();

  const finalInquiry = inquiry?.trim() || enquiry?.trim() || "";
  const finalMessage = message?.trim() || "";

  if (!email) {
    res.status(400).json({
      messages: [{ type: "error", message: "Please provide email" }],
      data: null,
    });
    return;
  }

  if (!fullName) {
    res.status(400).json({
      messages: [
        {
          type: "error",
          message: "Please provide name or first name / last name",
        },
      ],
      data: null,
    });
    return;
  }

  if (!contact) {
    res.status(400).json({
      messages: [{ type: "error", message: "Please provide contact" }],
      data: null,
    });
    return;
  }

  if (!finalInquiry) {
    res.status(400).json({
      messages: [{ type: "error", message: "Please provide inquiry" }],
      data: null,
    });
    return;
  }

  if (!finalMessage) {
    res.status(400).json({
      messages: [{ type: "error", message: "Please provide message" }],
      data: null,
    });
    return;
  }

  try {
    const newCommonForm = await prisma.commonForm.create({
      data: {
        email,
        name: fullName,
        contact,
        inquiry: finalInquiry,
        message: finalMessage,
      },
      select: {
        id: true,
        email: true,
        name: true,
        contact: true,
        inquiry: true,
        message: true,
      },
    });

    const html = await renderEmailTemplate("common-form", {
      email,
      fullName,
      firstName: finalFirstName || null,
      lastName: finalLastName || null,
      contactNumber: contact,
      inquiry: finalInquiry,
      message: finalMessage,
    });

    await transporter.sendMail({
      from: process.env.MAIL_FROM_ADDRESS || process.env.MAIL_USERNAME,
      to: "faseehkhan@htsol.ca",
      cc: "faseehullah2121@gmail.com",
      replyTo: email,
      subject: `HtSol Website Form Submission From ${fullName}`,
      html,
      text: `
HtSol Website Form Submission From

Name: ${fullName}
First Name: ${finalFirstName || "N/A"}
Last Name: ${finalLastName || "N/A"}
Email: ${email}
Contact: ${contact}
Inquiry: ${finalInquiry}
Message: ${finalMessage}
      `.trim(),
    });

    res.status(201).json({
      messages: [
        { type: "success", message: "Form submitted successfully." },
      ],
      data: { commonForm: newCommonForm },
    });
  } catch (error: any) {
    console.error("Error creating common form:", error);

    res.status(500).json({
      messages: [{ type: "error", message: "Could not submit form." }],
      data: null,
    });
  }
};