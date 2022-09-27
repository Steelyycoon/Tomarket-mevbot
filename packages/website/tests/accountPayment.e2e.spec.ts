import { expect, Page, test } from '@playwright/test';

import { E2EScreenshotPath } from './screenshots';

// https://magic.link/docs/auth/introduction/test-mode#usage
const MAGIC_SUCCESS_EMAIL = 'test+success@magic.link';

test.beforeEach(async ({ page }) => {
  await page.goto('/', { waitUntil: 'commit' });
});

test.describe('/account/payment', () => {
  test('redirects through login and back when not initially authenticated', async ({ page }, testInfo) => {
    const accountPaymentPathname = '/account/payment';
    // try to go to page that requires authn
    await page.goto(accountPaymentPathname, { waitUntil: 'networkidle' });
    // wait for redirect to a Log in page
    await page.locator('text=Log in').waitFor();
    const pageUrl = new URL(page.url());
    expect(pageUrl.pathname).toEqual('/login/');
    expect(pageUrl.searchParams.get('redirect_uri')).toEqual(accountPaymentPathname);
    // fill login
    await LoginTester().login(page, {
      email: MAGIC_SUCCESS_EMAIL,
    });
    // should be back at our initial target destination
    expect(new URL(page.url()).pathname).toEqual(accountPaymentPathname + '/');
    await page.screenshot({
      fullPage: true,
      path: await E2EScreenshotPath(testInfo, `accountPayment-noauth`),
    });
  });
  test('can access when authenticated', async ({ page }, testInfo) => {
    page.on('pageerror', err => {
      console.error('pageerror', err);
    });
    const tester = LoginTester();
    await page.goto(tester.loginHref);
    await tester.login(page, {
      email: MAGIC_SUCCESS_EMAIL,
    });
    await page.goto('/account/payment/');
    await expect(page).toHaveURL('/account/payment/');
    await page.locator('text=Your current plan is').waitFor();
    await page.screenshot({
      fullPage: true,
      path: await E2EScreenshotPath(testInfo, `accountPayment`),
    });
  });
  test('can enter credit card details', async ({ page }) => {
    const tester = LoginTester();
    await page.goto(tester.loginHref);
    await tester.login(page, { email: MAGIC_SUCCESS_EMAIL });
    await page.goto(AccountPaymentTester().url);
    await AccountPaymentTester().fillCreditCardDetails(page);
    await AccountPaymentTester().clickAddCardButton(page);
  });
});

function LoginTester({
  loginHref = '/login/',
}: {
  loginHref?: string;
} = {}) {
  async function fillLoginForm(page: Page, email: string) {
    await page.locator('.login-email').fill(email);
  }
  async function submitLoginForm(page: Page) {
    const loginButton = page.locator('.login-content .section-email button');
    await loginButton.isVisible();
    await Promise.all([page.waitForNavigation({ waitUntil: 'networkidle' }), loginButton.click()]);
  }
  async function login(
    page: Page,
    {
      email,
    }: {
      email: string;
    }
  ) {
    await fillLoginForm(page, email);
    await submitLoginForm(page);
  }
  return { login, loginHref, submitLoginForm };
}

function AccountPaymentTester() {
  return {
    url: '/account/payment',
    async fillCreditCardDetails(page: Page) {
      const stripeFrame = page.frameLocator('.billing-card iframe').first();
      await stripeFrame.locator('[placeholder="Card number"]').fill('4242424242424242');
      await stripeFrame.locator('[placeholder="MM / YY"]').fill('04/30');
      await stripeFrame.locator('[placeholder="CVC"]').fill('242');
    },
    async clickAddCardButton(page: Page) {
      await page.locator('text=Payment MethodsAdd Card >> button').click();
    },
  };
}
