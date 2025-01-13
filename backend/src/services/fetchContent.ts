import { Page } from "puppeteer";

export async function fetchContent(page: Page): Promise<string | null> {
  return await page.evaluate(() => {
    const targetElement = document.querySelector(
      "#wp--skip-link--target > div.entry-content"
    );

    if (!targetElement) {
      throw new Error("Elemento não encontrado.");
    }

    const elementsToRemove = targetElement.querySelectorAll(
      ".wp-block-button, .has-vivid-red-color, .wp-block-audio, iframe, ins"
    );
    elementsToRemove.forEach((el) => el.remove());

    return targetElement.innerHTML;
  });
}
