<div align="center">

# GKIA Assistente
### GK Smart Soluções · Brasil 🇧🇷

**Aprendendo a criar fluxos multiagentes confiáveis — uma etapa testável de cada vez.**

**Public Open-Source Companion · v0.1.0**

[🇧🇷 Português](#português) · [🇬🇧 English](#english) · [Arquitetura](docs/ARCHITECTURE.md) · [Contribuir](CONTRIBUTING.md)

</div>

---

## Português

### Nossa história

A **GKIA Assistente** é uma iniciativa brasileira da **GK Smart Soluções**, criada no processo de aprender a construir tecnologia para solucionar problemas reais. Começamos com mudanças manuais no código e estamos evoluindo para fluxos de desenvolvimento com planejamento, agentes especializados, revisões e testes.

O sistema GKIA principal ainda está em **desenvolvimento privado**. Este repositório é um **componente público independente e original**, preparado para estudo e colaboração — não é o código do sistema privado nem contém dados de clientes.

### O que este projeto público faz

- Orquestra tarefas sequenciais com agentes registrados explicitamente.
- Compartilha resultados anteriores com etapas seguintes.
- Permite parar na falha ou continuar de modo controlado.
- Oferece cancelamento antes de iniciar novas tarefas e limite máximo de tarefas.
- Publica eventos de progresso sem entradas ou saídas sensíveis.
- Inclui testes automatizados, integração contínua e exemplo com dados fictícios.

**Não é um serviço de IA comercial, integração real com modelos, plataforma hospedada ou sistema de produção.** Não requer chaves, banco de dados ou instalação de dependências de terceiros.

### Experimente

Requer Node.js 20 ou superior.

~~~bash
git clone https://github.com/gustavoalmeidalsp-collab/GK-IA-projeto-pessoal.git
cd GK-IA-projeto-pessoal
npm run check
npm test
npm run example
~~~

### Arquitetura

~~~mermaid
flowchart LR
  T[Tarefas] --> V[Validação]
  V --> P[Planejador]
  P --> E[Executor]
  E --> Q[Revisor]
  Q --> R[Relatório]
~~~

### Por que abrir o código?

Queremos criar componentes pequenos, reproduzíveis e úteis para outras pessoas aprendendo a estruturar fluxos assistidos por IA. O projeto público é novo e **não afirmamos números de downloads, usuários externos, dependências ou contribuidores que ainda não temos**.

Leia a [arquitetura](docs/ARCHITECTURE.md), a [política de segurança](SECURITY.md) e o [roteiro de evolução](docs/ROADMAP.md). Licença: [MIT](LICENSE).

---

## English

### What is GKIA Assistente?

**GKIA Assistente** is an independent learning and technology initiative by **GK Smart Soluções** in Brazil. The broader private project explores coordinating specialized AI agents, development tasks, quality checks, and repeatable engineering workflows.

This repo is a **small, independent open-source companion module** demonstrating sequential task orchestration, named handlers, controlled failure behavior, and privacy-conscious progress events. It is not a mirror or release of our private GKIA system.

### Included in v0.1.0

- Dependency-free Node.js 20+ JavaScript task orchestrator.
- Explicit handler registration and sequential execution.
- Earlier results accessible to later steps.
- Stop-on-error or continue-on-error behavior.
- Maximum 50 tasks and pre-task cancellation.
- Minimal event payloads, automated tests, and a fictional runnable example.

**Not included:** real AI APIs, production authentication, external user adoption, hosted service or private client software.

### Get started

~~~bash
npm run check
npm test
npm run example
~~~

The example uses mocked roles and fictional data. It sends no messages and contacts no external APIs.

### Contribute

See [CONTRIBUTING.md](CONTRIBUTING.md) and [SECURITY.md](SECURITY.md). We welcome feedback and incremental improvements while preserving the boundary between this public educational module and private client projects.

---

<sub>GKIA Assistente · GK Smart Soluções · Public educational module · 2026</sub>
