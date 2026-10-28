import { Page, expect } from '@playwright/test'

// Helper: dismiss LegalConsentModal if present
export async function dismissConsent(page: Page) {
  await page.addInitScript(() => {
    localStorage.setItem('legal_consent_accepted', 'true')
  })
}

// Helper: wait for page to be interactive (no overlays)
export async function ready(page: Page) {
  await page.waitForLoadState('networkidle')
  const overlay = page.locator('.fixed.inset-0.z-\\[9999\\]')
  if (await overlay.isVisible().catch(() => false)) {
    const acceptBtn = page.getByText('Я подтверждаю согласие')
    if (await acceptBtn.isVisible().catch(() => false)) {
      await acceptBtn.click()
      await page.waitForTimeout(500)
    }
  }
}

// Page Object: Home page
export class HomePage {
  constructor(private page: Page) {}

  async goto() {
    await this.page.goto('/')
    await ready(this.page)
  }

  get hero() { return this.page.locator('h1') }
  get searchInput() { return this.page.locator('input[type="text"]').first() }
  get searchButton() { return this.page.getByRole('button', { name: 'Найти в базе' }) }
  get phoneTab() { return this.page.getByRole('button', { name: 'По номеру' }) }
  get companyTab() { return this.page.getByRole('button', { name: 'По компании' }) }

  async search(query: string) {
    await this.searchInput.fill(query)
    await this.searchButton.click()
    await this.page.waitForURL('**q=*')
  }

  async switchToCompany() {
    await this.companyTab.click()
  }

  async switchToPhone() {
    await this.phoneTab.click()
  }
}

// Page Object: Navbar
export class Navbar {
  constructor(private page: Page) {}

  get container() { return this.page.locator('header').first() }
  get homeLink() { return this.container.getByRole('link', { name: 'Главная' }) }
  get scamsLink() { return this.container.getByRole('link', { name: 'База номеров' }) }
  get registryLink() { return this.container.getByRole('link', { name: 'Мошенники' }) }
  get aiLink() { return this.container.getByRole('link', { name: 'AI Анализ' }) }
  get apiLink() { return this.container.getByRole('link', { name: 'API' }) }
  get loginButton() { return this.container.getByRole('button', { name: /войти/i }) }
  get languageSwitcher() { return this.container.locator('button:has(svg.lucide-globe)') }

  async goToScams() {
    await this.scamsLink.click()
    await this.page.waitForURL('**/scams')
  }

  async goToRegistry() {
    await this.registryLink.click()
    await this.page.waitForURL('**/registry')
  }

  async openLanguageSwitcher() {
    await this.languageSwitcher.click()
    await this.page.waitForTimeout(500)
  }
}

// Page Object: Social Scam Report Form
export class SocialScamReportForm {
  constructor(private page: Page) {}

  async goto() {
    await this.page.goto('/registry/report')
    await ready(this.page)
  }

  get title() { return this.page.getByText(/Жалоба на мошенника/i) }
  get submitButton() { return this.page.getByRole('button', { name: /опубликовать жалобу/i }) }
  get cancelButton() { return this.page.getByRole('button', { name: /отмена/i }) }
  get errorBox() { return this.page.locator('.bg-red-50') }

  async selectPlatform(name: string) {
    await this.page.locator(`button:has-text("${name}")`).first().click()
    await this.page.waitForTimeout(300)
  }

  async selectCategory(name: string) {
    await this.page.locator(`button:has-text("${name}")`).first().click()
    await this.page.waitForTimeout(300)
  }

  async fillUsername(value: string) {
    await this.page.locator('input[name="username"]').fill(value)
  }

  async fillProfileUrl(value: string) {
    await this.page.locator('input[name="profileUrl"]').fill(value)
  }

  async fillDisplayName(value: string) {
    await this.page.locator('input[name="displayName"]').fill(value)
  }

  async fillDescription(value: string) {
    await this.page.locator('textarea[name="description"]').fill(value)
  }

  async fillAmount(value: string) {
    await this.page.locator('input[name="amountScammed"]').fill(value)
  }

  async selectRegion(name: string) {
    await this.page.locator('select[name="region"]').selectOption({ label: name })
  }

  async toggleTag(tag: string) {
    await this.page.locator(`button:has-text("#${tag}")`).first().click()
  }

  async submit() {
    // Use evaluate to bypass overlay
    await this.page.evaluate(() => {
      const form = document.querySelector('form')
      if (form) {
        const event = new Event('submit', { bubbles: true, cancelable: true })
        form.dispatchEvent(event)
      }
    })
  }

  async submitViaButton() {
    await this.submitButton.click({ force: true })
  }
}

// Page Object: Phone Scam Report Form
export class PhoneScamReportForm {
  constructor(private page: Page) {}

  async goto() {
    await this.page.goto('/report')
    await ready(this.page)
  }

  get title() { return this.page.getByText(/Сообщить о нарушении/i) }
  get submitButton() { return this.page.getByRole('button', { name: /отправить|добавить|опубликовать/i }) }

  async fillPhone(value: string) {
    await this.page.locator('input[name="phone"], input[placeholder*="телефон"]').first().fill(value)
  }

  async fillCompany(value: string) {
    await this.page.locator('input[name="company"], input[placeholder*="компани"]').first().fill(value)
  }

  async fillDescription(value: string) {
    await this.page.locator('textarea[name="description"], textarea').first().fill(value)
  }

  async selectType(type: string) {
    const select = this.page.locator('select[name="type"], select').first()
    if (await select.isVisible()) {
      await select.selectOption({ label: type })
    }
  }
}

// Page Object: Registry page
export class RegistryPage {
  constructor(private page: Page) {}

  async goto() {
    await this.page.goto('/registry')
    await ready(this.page)
  }

  get reportLink() { return this.page.getByRole('link', { name: /подать жалобу|сообщить о мошеннике/i }) }

  async filterByPlatform(platform: string) {
    const btn = this.page.locator(`button:has-text("${platform}")`).first()
    if (await btn.isVisible()) {
      await btn.click()
      await this.page.waitForTimeout(1000)
    }
  }
}

// Page Object: Scams list page
export class ScamsListPage {
  constructor(private page: Page) {}

  async goto() {
    await this.page.goto('/scams')
    await ready(this.page)
  }
}

// Page Object: Leaderboard
export class LeaderboardPage {
  constructor(private page: Page) {}

  async goto() {
    await this.page.goto('/leaderboard')
    await ready(this.page)
  }

  get filterButtons() { return this.page.getByRole('button').filter({ hasText: /неделя|месяц|всё время|все/i }) }
}
