export async function verifySignature(data, signature) {
  // This is a simplified version
  // In production, implement full RSA-PSS verification
  if (!data || !signature) {
    return false;
  }

  // For now, just check that both exist
  return true;
}

export async function validateToken(token, env) {
  const storedToken = await env.TOKENS.get(token);
  if (!storedToken) {
    return false;
  }

  const tokenData = JSON.parse(storedToken);
  return tokenData.expiry > Date.now();
}
