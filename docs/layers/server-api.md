# Índice:
- [Client](/docs/layers/client.md)
- [Server API](/docs/layers/server-api.md)
- [Server](/docs/layers/server-implementation.md)


# API (base)
Basicamente um intermediário entre o Client (NodeEditor) e o que quer que seja que esteja sendo desenvolvido que usa os Nodes.

### Implementação:
- websockets (provavelmente).
- broadcasting (para Clients específicos), em situações como o modo Stop Motion

### Requisitos:
- Ser simples o suficiente para ser implementada na maior parte das linguagens modernas;
- Ser o mais modificável e básica possível, toda implementação específca deve ser feita no servidor (ou em uma versão específica da API voltada para seu objetivo);
- Conectar-se com múltiplos Clients;
- Apresentar uma base de comunicação entre Client e Server (rotas padrão, ex: get-node-types/, log-on-server/);

### Features principais:
- Converter informações recebidas em formato .json para Classes ou equivalentes da linguagem específica (para facilitar type-safety);
- Gerenciamento de Clients (gerenciamento de sessões);
- Rotas padrão;
- Comunicação bilateral (o Client pode pedir informações e o Server pode enviar informações para o Client quando necessário);


# Especificações:

## Rotas Padrão:
São as rotas que, independente do objetivo, todas as variações da API devem apresentar.
Lembrando que a maior parte das rotas requerem autenticação do usuário, já que boa parte das rotas são relacionadas à cena carregada, que pode ser diferente entre os usuários conectados ao servidor.

## Tipos de rota:
- Request: o Client precisa "chamar" a rota;
- Broadcast: o Server pode enviar os conteúdos da rota;
As que estão sem nenhuma marcação são Request.

Rotas de Setup e Manutenção:
- Login;
- Registro (opcional, caso a API use algum registro externo);
- Get Server Addons (addons recomendados e necessários);
- Get Server Node Types;
- Validate Node Scene;

Rotas de Tasks:
- Unload Node Scene;
- Load Node Scene;
- Get Loaded Node Scene;

- Run Loaded Scene;
- Step Scene Tick (para dar passos no modo Stop Motion);
- Toggle Pause Scene;
- Force Stop Running;

Rotas Específcias para nodes:
- Validate Node Instance;
- Live Node Data (Request e Broadcast);
