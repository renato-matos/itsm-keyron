# Guia de Testes Unitários - Backend ITSM

## Instalação

As dependências já estão instaladas (`jest` e `supertest`). Se não estiverem, execute:

```bash
npm install --save-dev jest supertest
```

## Estrutura dos Testes

```
backend/
├── tests/
│   ├── user.test.js        # Testes do endpoint de usuários
│   └── service.test.js     # Testes do endpoint de serviços
├── jest.config.js          # Configuração do Jest
└── package.json
```

## Executar Testes

### Rodar todos os testes uma vez:
```bash
npm test
```

### Rodar testes em modo watch (atualiza automaticamente):
```bash
npm run test:watch
```

### Ver cobertura de testes:
```bash
npm run test:coverage
```

## Estrutura dos Testes

Cada arquivo de teste está organizado com a seguinte estrutura:

```javascript
describe('Nome do teste', () => {
  beforeEach(() => {
    // Configuração antes de cada teste
  });

  describe('GET /endpoint', () => {
    it('deve fazer algo específico', async () => {
      const response = await request(app)
        .get('/endpoint')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.statusCode).toBe(200);
      expect(response.body).toHaveProperty('id');
    });
  });
});
```

## O que é testado

### User Routes (user.test.js)

✅ **POST /users** - Criar usuário
- Criar usuário com dados válidos
- Validar erro sem token
- Validar email duplicado
- Validar dados obrigatórios

✅ **GET /users** - Listar usuários
- Listar todos os usuários
- Validar erro sem token
- Validar token inválido

✅ **PUT /users/:id** - Atualizar usuário
- Atualizar usuário existente
- Validar erro com ID inexistente

✅ **DELETE /users/:id** - Deletar usuário
- Deletar usuário existente
- Validar erro com ID inexistente

### Service Routes (service.test.js)

✅ **POST /services** - Criar serviço
- Criar com dados válidos
- Validar erro sem autenticação

✅ **GET /services** - Listar serviços
- Listar todos os serviços
- Validar erro sem token

## Exemplo de Teste Personalizado

Para adicionar um novo teste, abra o arquivo correspondente e adicione dentro de um `describe`:

```javascript
it('deve fazer algo específico', async () => {
  const response = await request(app)
    .post('/users')
    .set('Authorization', `Bearer ${authToken}`)
    .send({
      name: 'Teste',
      email: 'teste@example.com',
      password: 'senha123'
    });

  // Validações
  expect(response.statusCode).toBe(201);
  expect(response.body.name).toBe('Teste');
});
```

## Matchers do Jest (Assertions)

| Matcher | Descrição |
|---------|-----------|
| `expect(x).toBe(y)` | Igualdade estrita |
| `expect(x).toEqual(y)` | Igualdade profunda |
| `expect(x).toHaveProperty('key')` | Verificar propriedade |
| `expect(arr).toContain(item)` | Verificar se contém item |
| `expect(fn).toThrow()` | Verificar se lança erro |
| `expect(x).toBeNull()` | Verificar se é null |
| `expect(x).toBeDefined()` | Verificar se é definido |

## Dicas

1. **Use `beforeEach()`** para setup comum entre testes
2. **Use `afterEach()`** para limpeza após testes
3. **Agrupe testes relacionados** com `describe()`
4. **Nomes descritivos** para saber rapidamente o que falhou
5. **Um `it()` por comportamento** - não teste múltiplas coisas em um teste

## Próximos Passos

- [ ] Adicionar testes para autenticação (auth.test.js)
- [ ] Aumentar cobertura de testes para 80%+
- [ ] Configurar CI/CD para rodar testes automaticamente
- [ ] Adicionar testes de integração
