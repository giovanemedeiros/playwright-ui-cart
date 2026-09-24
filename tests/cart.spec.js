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
  test('Should add multiple products to cart and calculate total successfully', async ({ page, request }) => {
    test.setTimeout(60000);
    
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

    // Navigate to FIRST product details
    await page.getByText('Detalhes').first().click();
    await page.waitForTimeout(2000);

    // Get first product name and price
    const firstProductName = await page.getByTestId('product-detail-name').first().textContent();
    const firstProductRawPrice = await page.getByRole('heading', { name: 'R$:' }).first().textContent();
    const firstProductPrice = firstProductRawPrice.replace('R$:', '').trim();

    // Add first product to cart list
    await page.getByTestId('adicionarNaLista').click();
    await page.waitForTimeout(2000);

    // Opens store home page again
    await page.goto('https://front.serverest.dev/home');
    await expect(page.getByText(/serverest store/i)).toBeVisible();
    await page.waitForTimeout(2000);

    // Navigate to SECOND product details (index 1 on home page)
    await page.getByText('Detalhes').nth(1).click();
    await page.waitForTimeout(2000);

    // Get second product name and price (.first() on product details page)
    const secondProductName = await page.getByTestId('product-detail-name').first().textContent();
    const secondProductRawPrice = await page.getByRole('heading', { name: 'R$:' }).first().textContent();
    const secondProductPrice = secondProductRawPrice.replace('R$:', '').trim();

    // Add second product to cart list
    await page.getByTestId('adicionarNaLista').click();
    await page.waitForTimeout(2000);

    // Assertions on shopping cart list page
    await expect(page.getByRole('heading', { name: 'Lista de Compras' })).toBeVisible();

    // Validate Product 1 and its price
    await expect(page.getByText(new RegExp(`Produto:.*${firstProductName.trim()}`, 'i'))).toBeVisible();
    await expect(page.getByText(new RegExp(`Preço.*${firstProductPrice}`, 'i'))).toBeVisible();
    
    // Validate Product 2 and its price
    await expect(page.getByText(new RegExp(`Produto:.*${secondProductName.trim()}`, 'i'))).toBeVisible();
    await expect(page.getByText(new RegExp(`Preço.*${secondProductPrice}`, 'i'))).toBeVisible();
    await page.waitForTimeout(5000);
  });
  
  // ---- [CT03] Increment product quantity in cart ----
  test('Should increment product quantity in cart successfully', async ({ page, request }) => {
    test.setTimeout(60000);

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

    // Get product name and unit price
    const productName = await page.getByTestId('product-detail-name').first().textContent();
    const rawPrice = await page.getByRole('heading', { name: 'R$:' }).first().textContent();
    const unitPrice = Number(rawPrice.replace('R$:', '').trim());

    // Add product to cart list
    await page.getByTestId('adicionarNaLista').click();
    await page.waitForTimeout(2000);

    // Validate cart page heading and total quantity
    await expect(page.getByRole('heading', { name: 'Lista de Compras' })).toBeVisible();
    await expect(page.getByText('Total: 1')).toBeVisible();

    // Validate product quantity increase button is visible
    await expect(page.getByTestId('product-increase-quantity')).toBeVisible();
    await page.waitForTimeout(2000);

    // Increase product quantity two times
    await page.getByTestId('product-increase-quantity').click();
    // await page.waitForTimeout(2000);
    await page.getByTestId('product-increase-quantity').click();
    // await page.waitForTimeout(2000)

    const expectedTotalPrice = unitPrice * 3;

    // Assertions on shopping cart list page
    await expect(page.getByRole('heading', { name: 'Lista de Compras' })).toBeVisible();
    await expect(page.getByText(new RegExp(`Produto:.*${productName.trim()}`, 'i'))).toBeVisible();
    await expect(page.getByText('Total: 3')).toBeVisible();
    await expect(page.getByText(new RegExp(`Preço.*${expectedTotalPrice}`, 'i'))).toBeVisible();
    await page.waitForTimeout(5000);
  });

  // ---- [CT04] Update product quantity in cart ----
  test('Should persist cart items and quantities on page reload successfully', async ({ page, request }) => {
    test.setTimeout(60000);

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

    // First product

    // Opens DIRECTLY at store home page already logged in!
    await page.goto('https://front.serverest.dev/home');
    await expect(page.getByText(/serverest store/i)).toBeVisible();
    await page.waitForTimeout(2000);

    // Navigate to product details
    await page.getByText('Detalhes').first().click();
    await page.waitForTimeout(2000);

    // Get product name and unit price
    const firstProductName = await page.getByTestId('product-detail-name').first().textContent();
    const firstRawPrice = await page.getByRole('heading', { name: 'R$:' }).first().textContent();
    const firstUnitPrice = Number(firstRawPrice.replace('R$:', '').trim());

    // Add product to cart list
    await page.getByTestId('adicionarNaLista').click();
    await page.waitForTimeout(2000);

    // Validate cart page heading and total quantity
    await expect(page.getByRole('heading', { name: 'Lista de Compras' })).toBeVisible();
    await expect(page.getByText('Total: 1')).toBeVisible();

    // Validate product quantity increase button is visible
    await expect(page.getByTestId('product-increase-quantity').nth(0)).toBeVisible();
    await page.waitForTimeout(2000);

    // Increase product quantity two times
    await page.getByTestId('product-increase-quantity').nth(0).click();
    await page.waitForTimeout(2000);
    await page.getByTestId('product-increase-quantity').nth(0).click();
    await page.waitForTimeout(2000)

    await page.reload()

    const firstExpectedTotalPrice = firstUnitPrice * 3;

    // Assertions on shopping cart list page
    await expect(page.getByRole('heading', { name: 'Lista de Compras' })).toBeVisible();
    await expect(page.getByText(new RegExp(`Produto:.*${firstProductName.trim()}`, 'i'))).toBeVisible();
    await expect(page.getByText('Total: 3')).toBeVisible();
    await expect(page.getByText(new RegExp(`Preço.*${firstExpectedTotalPrice}`, 'i'))).toBeVisible();
    await page.waitForTimeout(5000);

    // Second product

    // Opens DIRECTLY at store home page already logged in!
    await page.goto('https://front.serverest.dev/home');
    await expect(page.getByText(/serverest store/i)).toBeVisible();
    await page.waitForTimeout(2000);

    // Navigate to product details
    await page.getByText('Detalhes').nth(1).click();
    await page.waitForTimeout(2000);

    // Get product name and unit price
    const secondProductName = await page.getByTestId('product-detail-name').first().textContent();
    const secondRawPrice = await page.getByRole('heading', { name: 'R$:' }).first().textContent();
    const secondUnitPrice = Number(secondRawPrice.replace('R$:', '').trim());

    // Add product to cart list
    await page.getByTestId('adicionarNaLista').click();
    await page.waitForTimeout(2000);

    // Validate cart page heading and total quantity
    await expect(page.getByRole('heading', { name: 'Lista de Compras' })).toBeVisible();
    await expect(page.getByText('Total: 1')).toBeVisible();

    // Validate product quantity increase button is visible
    await expect(page.getByTestId('product-increase-quantity').nth(1)).toBeVisible();
    await page.waitForTimeout(2000);

    // Increase product quantity four times
    await page.getByTestId('product-increase-quantity').nth(1).click();
    await page.waitForTimeout(2000);
    await page.getByTestId('product-increase-quantity').nth(1).click();
    await page.waitForTimeout(2000)
    await page.getByTestId('product-increase-quantity').nth(1).click();
    await page.waitForTimeout(2000);
    await page.getByTestId('product-increase-quantity').nth(1).click();
    await page.waitForTimeout(2000)

    await page.reload()

    const secondExpectedTotalPrice = secondUnitPrice * 5;

    // Final validations

    // First product validations
    await expect(page.getByRole('heading', { name: 'Lista de Compras' })).toBeVisible();
    await expect(page.getByText(new RegExp(`Produto:.*${firstProductName.trim()}`, 'i'))).toBeVisible();
    await expect(page.getByText('Total: 3')).toBeVisible();
    await expect(page.getByText(new RegExp(`Preço.*${firstExpectedTotalPrice}`, 'i'))).toBeVisible();

    // Second product validations
    await expect(page.getByRole('heading', { name: 'Lista de Compras' })).toBeVisible();
    await expect(page.getByText(new RegExp(`Produto:.*${secondProductName.trim()}`, 'i'))).toBeVisible();
    await expect(page.getByText('Total: 5')).toBeVisible();
    await expect(page.getByText(new RegExp(`Preço.*${secondExpectedTotalPrice}`, 'i'))).toBeVisible();
    await page.waitForTimeout(5000);
  });

  // ---- [CT05] Remove product from cart ----
  test('Should clear shopping cart list and display empty cart message successfully', async ({ page, request }) => {
    test.setTimeout(60000)
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

    // Navigate to FIRST product details
    await page.getByText('Detalhes').first().click();
    await page.waitForTimeout(2000);

    // Get first product name and price
    const firstProductName = await page.getByTestId('product-detail-name').first().textContent();
    const firstProductRawPrice = await page.getByRole('heading', { name: 'R$:' }).first().textContent();
    const firstProductPrice = firstProductRawPrice.replace('R$:', '').trim();

    // Add first product to cart list
    await page.getByTestId('adicionarNaLista').click();
    await page.waitForTimeout(2000);

    // Opens store home page again
    await page.goto('https://front.serverest.dev/home');
    await expect(page.getByText(/serverest store/i)).toBeVisible();
    await page.waitForTimeout(2000);

    // Navigate to SECOND product details (index 1 on home page)
    await page.getByText('Detalhes').nth(1).click();
    await page.waitForTimeout(2000);

    // Get second product name and price (.first() on product details page)
    const secondProductName = await page.getByTestId('product-detail-name').first().textContent();
    const secondProductRawPrice = await page.getByRole('heading', { name: 'R$:' }).first().textContent();
    const secondProductPrice = secondProductRawPrice.replace('R$:', '').trim();

    // Add second product to cart list
    await page.getByTestId('adicionarNaLista').click();
    await page.waitForTimeout(2000);

    // Assertions on shopping cart list page
    await expect(page.getByRole('heading', { name: 'Lista de Compras' })).toBeVisible();

    // Validate Product 1 and its price
    await expect(page.getByText(new RegExp(`Produto:.*${firstProductName.trim()}`, 'i'))).toBeVisible();
    await expect(page.getByText(new RegExp(`Preço.*${firstProductPrice}`, 'i'))).toBeVisible();
    
    // Validate Product 2 and its price
    await expect(page.getByText(new RegExp(`Produto:.*${secondProductName.trim()}`, 'i'))).toBeVisible();
    await expect(page.getByText(new RegExp(`Preço.*${secondProductPrice}`, 'i'))).toBeVisible();
    await page.waitForTimeout(2000);

    await page.getByTestId('limparLista').click();
    await expect(page.getByTestId('shopping-cart-empty-message')).toBeVisible();

    // Negative assertions (Ensure products were removed from UI)
    await expect(page.getByText(new RegExp(`Produto:.*${firstProductName.trim()}`, 'i'))).not.toBeVisible();
    await expect(page.getByText(new RegExp(`Produto:.*${secondProductName.trim()}`, 'i'))).not.toBeVisible();

    await page.waitForTimeout(5000);
  });

});
