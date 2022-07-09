import { test } from '@playwright/test';

test('test', async ({ page }) => {
	// Go to http://localhost:3000/
	await page.goto('http://localhost:3000/');

	// Click label:has-text("Click to upload or drag and drop Support any type of image.")
	await page
		.locator('label:has-text("Click to upload or drag and drop Support any type of image.")')
		.click();

	// Click input[type="number"] >> nth=0
	await page.locator('input[type="number"]').first().click();

	// Fill input[type="number"] >> nth=0
	await page.locator('input[type="number"]').nth(1).fill('100');

	// Click div:has-text("Click to upload or drag and drop Support any type of image. CONVERT") >> nth=1
	await page
		.locator('div:has-text("Click to upload or drag and drop Support any type of image. CONVERT")')
		.nth(1)
		.click();
});
