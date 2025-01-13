import { Page } from "puppeteer";

export async function getLiturgyLink(
  page: Page,
  hourName: string
): Promise<string | null> {
  return await page.evaluate((hourName: string) => {
    const links = Array.from(document.querySelectorAll<HTMLAnchorElement>("a"));
    const liturgyLinkElement = links.find(
      (link) => link.textContent?.trim() === hourName
    );
    return liturgyLinkElement?.href || null;
  }, hourName);
}
