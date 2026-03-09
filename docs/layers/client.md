# Índice:
- [Client](/docs/layers/client.md)
- [Server API](/docs/layers/server-api.md)
- [Server](/docs/layers/server-implementation.md)

# Client:
É voltado principalmente para edição dos conteúdos que existem ou são enviados para o servidor.
Exemplo:
- Edição de Node Scene
- Edição de NodeTypes

### O que o Client não deve fazer:
- Interpretar os Nodes (verificação de "sintaxe" é permitida com base nas limitações impostas pelo NodeTypes)
