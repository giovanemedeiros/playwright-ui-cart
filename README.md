# Playwright UI Cart - Automação do Carrinho de Compras

Projeto de automação de testes End-to-End (E2E) focado no módulo de **Carrinho de Compras / Lista de Compras** da aplicação web **Serverest**, desenvolvido com **Playwright** e **JavaScript**.

## Objetivo

Garantir a qualidade, integridade e correto funcionamento dos fluxos de adição, manipulação de quantidade, recálculo dinâmico de valores, persistência de estado e limpeza de produtos na lista de compras.

## Tecnologias Utilizadas

- **Playwright** (v1.x)
- **Node.js**
- **JavaScript (ES6+)**
- **Git / GitHub**

## Cenários de Teste Automatizados

| ID | Cenário | Descrição / Estratégia Técnica |
| :--- | :--- | :--- |
| **CT01** | Adicionar Produto à Lista | Valida a adição de um produto ao carrinho via tela de detalhes e verifica nome, preço unitário e quantidade inicial (`Total: 1`). |
| **CT02** | Adicionar Múltiplos Produtos | Valida a adição de dois produtos distintos à lista de compras, verificando a exibição dos cards e preços correspondentes. |
| **CT03** | Incrementar Quantidade | Valida a alteração da quantidade de itens no carrinho (de 1 para 3) e o recálculo dinâmico do valor total por produto (`unitPrice * 3`). |
| **CT04** | Persistência no Refresh (F5) | Valida se os produtos, quantidades e valores calculados na lista permanecem salvos e inalterados após recarregar a página (`page.reload()`). |
| **CT05** | Limpar Lista de Compras | Valida a remoção de todos os produtos ao clicar no botão "Limpar Lista" (`getByTestId('limparLista')`) e a exibição do estado de carrinho vazio (`shopping-cart-empty-message`). |

## Estratégias de Teste e Boas Práticas

- **Bypass de Autenticação em Background:** Os testes realizam o cadastro do usuário (`POST /usuarios`) e login (`POST /login`) silenciosamente via API REST, injetando o token JWT no `localStorage` do navegador para iniciar a execução diretamente nas telas de interesse.
- **Massa de Dados Dinâmica:** Utilização de gerador incremental via arquivo `counter.json` para evitar conflitos de dados entre execuções paralelas.
- **Auto-waiting e Asserções Robustas:** Uso de correspondências flexíveis com expressões regulares (`RegExp`) e validações positivas e negativas.

## Gestão do Projeto e Processos Ágeis

O planejamento, especificação e ciclo de vida dos testes foram gerenciados utilizando o **GitHub Projects (Kanban)**:

- **Casos de Teste Imperativos:** Mapeados em formato de *Issues* no GitHub com critérios de aceitação e passos de reprodução.
- **Git Branching Workflow:** Desenvolvimento isolado por funcionalidade através de *Feature Branches* (`feat/CT0x-...`), integrado à `main` via *Pull Requests*.
- **Fluxo Kanban:** Acompanhamento do progresso das tarefas nas colunas `Backlog`, `Ready`, `In progress`, `In review` e `Done`.

## Estrutura do Projeto

```text
├── tests/
│   └── cart.spec.js      # Suíte de testes E2E do Carrinho de Compras
├── counter.json          # Persistência de contador incremental de massa
├── playwright.config.js  # Configurações globais do Playwright
├── package.json          # Dependências e scripts do projeto
└── .gitignore            # Arquivos e pastas ignorados pelo Git
```

## Pré-requisitos

- **Node.js** (versão 18 ou superior)
- **NPM**

## Como Executar os Testes

1. **Clonar o repositório:**
   ```bash
   git clone git@github.com:giovanemedeiros/playwright-ui-cart.git
   cd playwright-ui-cart
   ```

2. **Instalar as dependências:**
   ```bash
   npm install
   ```

3. **Executar a suíte de testes completa (Headless):**
   ```bash
   npx playwright test
   ```

4. **Executar em modo sequencial com interface gráfica (Headed):**
   ```bash
   npx playwright test tests/cart.spec.js --workers=1 --project=chromium --headed
   ```

5. **Gerar e abrir o relatório de testes (HTML Report):**
   ```bash
   npx playwright show-report
   ```
