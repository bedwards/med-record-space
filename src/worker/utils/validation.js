export function validatePayload(payload) {
  if (!payload || typeof payload !== 'object') {
    return false;
  }

  const requiredFields = ['encrypted', 'signature', 'type'];
  return requiredFields.every(field => payload.hasOwnProperty(field));
}

export function validateQuery(query) {
  if (!query || typeof query !== 'object') {
    return false;
  }

  return query.hasOwnProperty('id');
}
