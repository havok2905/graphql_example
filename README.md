# Graphql Example

## Requests

`{ "query": " { todos  { id, message } }" }`

`{ "query": "mutation CreateTodo($message: String) { createTodo(message: $message) { id, message } }", "variables": { "message": "hi" } }`

`{ "query": "mutation DestroyTodo($id: String) { destroyTodo(id: $id) { id, message } }", "variables": { "id": "316ab07d444d914525c7b345240fdc06" } }`