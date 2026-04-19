import ejs from "ejs";
import path from "path";

export const renderEmailTemplate = async (
  templateName: string,
  data: Record<string, any>,
): Promise<string> => {
  const templatePath = path.join(
    process.cwd(),
    "app",
    "views",
    `${templateName}.ejs`,
  );

  return await ejs.renderFile(templatePath, data);
};