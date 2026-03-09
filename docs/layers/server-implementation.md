# Índice:
- [Client](/docs/layers/client.md)
- [Server API](/docs/layers/server-api.md)
- [Server](/docs/layers/server-implementation.md)


# Servidor (varia por objetivo)
É o espaço em que os Nodes são interpretados (independente do objetivo dos Nodes).

### Features principais:
- Interpretar as informações recebidas pela API;

### Capacidades:
- Sobreescrever as Classes padrão da API (ex: API tem um BaseNodeType, que funciona para qualquer tipo de node, só que para os meus objetivos é melhor que isso seja interpretado de outra forma);
- Ser interrompido e resumido a qualquer momento (opcional);
- Conexão com múltiplos Clients (teoricamente opcional, mas é interessante que se o intuito do servidor não incluir a conexão com múltiplos Clients, nas configurações do Server, designar o limite de usuários para 1)