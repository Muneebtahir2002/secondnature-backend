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
    firstName,
    lastName,
    contact,
    city,
    service,
    companyUrl,
    page,
  } = req.body;

  const finalFirstName = firstName?.trim() || "";
  const finalLastName = lastName?.trim() || "";
  const fullName =
    name?.trim() || `${finalFirstName} ${finalLastName}`.trim();

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

  if (!page) {
    res.status(400).json({
      messages: [{ type: "error", message: "Please provide page" }],
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
        city: city || null,
        service: service || null,
        companyUrl: companyUrl || null,
        enquiry,
        page,
      },
      select: {
        id: true,
        email: true,
        name: true,
        contact: true,
        city: true,
        service: true,
        companyUrl: true,
        enquiry: true,
        page: true,
      },
    });

    const html = await renderEmailTemplate("common-form", {
      email,
      fullName: fullName,
      firstName: finalFirstName || null,
      lastName: finalLastName || null,
      contactNumber: contact,
      city,
      services: service,
      companyName: companyUrl,
      message: enquiry,
      page,
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
City: ${city || "N/A"}
Service: ${service || "N/A"}
Company URL: ${companyUrl || "N/A"}
Enquiry: ${enquiry}
Page: ${page}
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