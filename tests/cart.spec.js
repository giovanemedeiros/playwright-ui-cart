import { test, expect } from '@playwright/test';
import fs from 'fs';
import path from 'path';

// Helper Function
function getNextUserNumber() {
  const filePath = path.resolve('counter.json');
  let currentNumber = 1;

  if (fs.existsSync(filePath)) {
    const data = fs.readFileSync(filePath, 'utf-8');
    currentNumber = JSON.parse(data).count || 1;
  }

  // Writes the next number (+1) to counter.json file
  fs.writeFileSync(filePath, JSON.stringify({ count: currentNumber + 1 }, null, 2));
  return currentNumber;
}

test.describe('Shopping Cart - Serverest', () => {

  // ---- [CT01] Add product to cart and validate quantity ----
  test('Should add a product to cart successfully', async ({ page, request }) => {
    // Get incremental number and create user via API
    const userNumber = getNextUserNumber();
    const randomUser = `testqap2v${userNumber}`;
    const randomEmail = `testqap2v${userNumber}@email.com`;
    
    // Silent user registration via API (Background)
    await request.post('https://serverest.dev/usuarios', {
      data: {
        nome: randomUser,
        email: randomEmail,
        password: 'testqa26',
        administrador: 'false'
      }
    });

    // Silent login
    const loginResponse = await request.post('https://serverest.dev/login', {
      data: {
        email: randomEmail,
        password: 'testqa26'
      }
    });

    const { authorization } = await loginResponse.json();

    // Inject token into browser's localStorage before loading page
    await page.addInitScript(({ token }) => {
      window.localStorage.setItem('serverest/userToken', token);
    }, authorization);

    // Opens DIRECTLY at store home page already logged in!
    await page.goto('https://front.serverest.dev/home');
    await expect(page.getByText(/serverest store/i)).toBeVisible();
    await page.waitForTimeout(2000);

    // Navigate to product details
    await page.getByText('Detalhes').first().click();
    await page.waitForTimeout(2000);

    // Get product name and price
    const productName = await page.getByTestId('product-detail-name').first().textContent();
    const rawPrice = await page.getByRole('heading', { name: 'R$:' }).first().textContent();
    const productPrice = rawPrice.replace('R$:', '').trim();

    // Add product to cart list
    await page.getByTestId('adicionarNaLista').click();
    await page.waitForTimeout(2000);

    // Validate cart page heading
    await expect(page.getByRole('heading', { name: 'Lista de Compras' })).toBeVisible();

    // Validate added product name
    await expect(page.getByText(new RegExp(`Produto:.*${productName.trim()}`, 'i'))).toBeVisible();

    // Validate added product price
    await expect(page.getByText(new RegExp(`Preço.*${productPrice}`, 'i'))).toBeVisible();

    // Validate initial item total quantity is 1
    await expect(page.getByText('Total: 1')).toBeVisible();
    await page.waitForTimeout(5000);
  });

  // ---- [CT02] Add multiple products to cart ----

  // ---- [CT03] Validate cart total ----
  
  // ---- [CT04] Update product quantity in cart ----

  // ---- [CT05] Remove product from cart ----

});
