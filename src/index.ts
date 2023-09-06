import puppeteer, { Browser, Page } from 'puppeteer';

(async (): Promise<void> => {
    // Launch a new browser instance
    const browser: Browser = await puppeteer.launch();

    // Open a new page
    const page: Page = await browser.newPage();

    // Navigate to the desired website
    await page.goto('https://plugandplayground.dev');

	await new Promise(resolve => setTimeout(resolve, 2000));

    // Take a screenshot
    await page.screenshot({ path: 'screenshot.png' });
	

    // Close the browser
    await browser.close();
})();
