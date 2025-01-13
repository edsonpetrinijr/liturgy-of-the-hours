import { Page } from "puppeteer";

export async function findLinkForDate(
  page: Page,
  month: string,
  day: number
): Promise<string | null> {
  return await page.evaluate(
    (month, day) => {
      const h2Element = Array.from(document.querySelectorAll("h2")).find(
        (h2) => h2.textContent?.trim() === month
      );

      if (!h2Element) return null;

      const siblingDiv = h2Element.nextElementSibling;
      if (!siblingDiv || siblingDiv.tagName !== "DIV") return null;

      const tableCells = siblingDiv.querySelectorAll("td");
      let targetCell: HTMLElement | null = null;

      tableCells.forEach((cell, index) => {
        if (tableCells[index + 1]?.textContent?.trim() === day.toString()) {
          targetCell = tableCells[index + 1] as HTMLElement;
        }
      });

      if (!targetCell) return null;

      // const nextElement = targetCell.nextElementSibling;
      // return nextElement?.querySelector("a")?.href || null;
      return "";
    },
    month,
    day
  );
}
