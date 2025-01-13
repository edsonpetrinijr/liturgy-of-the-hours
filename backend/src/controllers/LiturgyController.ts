import { FastifyInstance } from "fastify";
import { fetchContent } from "../services/fetchContent";
import { findLinkForDate } from "../services/findLinkForDate";
import puppeteer from "puppeteer";
import { getLiturgyLink } from "../services/getLiturgyLink";
import fs from "fs";
import path from "path";

async function saveBackup(
  content: any,
  hour: string,
  month: string,
  day: number
) {
  const backupDirectory = path.join(
    __dirname,
    "../../backups",
    month,
    day.toString()
  );
  const fileName = `${hour}.html`;
  const filePath = path.join(backupDirectory, fileName);

  if (!fs.existsSync(backupDirectory)) {
    fs.mkdirSync(backupDirectory, { recursive: true });
  }

  fs.writeFileSync(filePath, content, "utf-8");
  console.log(`Backup salvo em: ${filePath}`);
}

async function fileExists(
  hour: string,
  month: string,
  day: number
): Promise<boolean> {
  const backupDirectory = path.join(
    __dirname,
    "../../backups",
    month,
    day.toString()
  );
  const fileName = `${hour}.html`;
  const filePath = path.join(backupDirectory, fileName);

  return fs.existsSync(filePath);
}

export async function liturgyController(fastify: FastifyInstance) {
  fastify.get("/:hour/:month/:day", async (request, reply) => {
    const { hour, month, day } = request.params as {
      hour: string;
      month: string;
      day: number;
    };

    const backupExists = await fileExists(hour, month, day);

    if (backupExists) {
      const filePath = path.join(
        __dirname,
        "../../backups",
        month,
        day.toString(),
        `${hour}.html`
      );
      const content = fs.readFileSync(filePath, "utf-8");
      console.log(`Backup encontrado e retornado de: ${filePath}`);
      reply.type("text/html; charset=utf-8").send(content);
      return;
    }

    const calendarUrl = "https://liturgiadashoras.online/calendario/";
    const browser = await puppeteer.launch({
      headless: true,
      defaultViewport: null,
    });
    const page = await browser.newPage();

    try {
      await page.goto(calendarUrl, { waitUntil: "networkidle2" });

      const dateLink = await findLinkForDate(page, month, day);

      if (!dateLink) {
        console.log("Nenhum link encontrado para a data especificada.");
        return;
      }

      console.log("Link encontrado para a data:", dateLink);

      await page.goto(dateLink, { waitUntil: "networkidle2" });

      const liturgyLinks: { [key: string]: string } = {
        matins: "Ofício das Leituras",
        lauds: "Laudes",
        midday: "Sexta",
        vespers: "Vésperas",
        compline: "Completas",
      };

      const selectedLiturgy = liturgyLinks[hour.toLowerCase()];

      if (!selectedLiturgy) {
        console.log("Hora não reconhecida ou não encontrada.");
        reply.status(400).send({ error: "Invalid hour provided" });
        return;
      }

      const liturgyLink = await getLiturgyLink(page, selectedLiturgy);

      if (liturgyLink) {
        console.log(`${selectedLiturgy} link encontrado:`, liturgyLink);
      } else {
        console.log(`O link de ${selectedLiturgy} não foi encontrado.`);
        reply.status(404).send({ error: `${selectedLiturgy} not found` });
        return;
      }

      await page.goto(liturgyLink, { waitUntil: "domcontentloaded" });

      const content = await fetchContent(page);

      await saveBackup(content, hour, month, day);

      reply.type("text/html; charset=utf-8").send(content);
    } catch (error) {
      console.error(error);
      reply.status(500).send({ error: "Failed to fetch liturgy content" });
    } finally {
      await browser.close();
    }
  });
}
