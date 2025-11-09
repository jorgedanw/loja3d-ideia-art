// Guard bem simples para rotas do /api/admin/*
// Envia um header "x-admin-key" nas requisições do painel.
// Defina ADMIN_KEY no .env (ex.: ADMIN_KEY=meu-segredo-forte)

export function isAdminRequest(req: Request) {
  const header = req.headers.get("x-admin-key");
  const expected = process.env.ADMIN_KEY;
  return expected && header === expected;
}
