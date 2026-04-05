export const parseTemplate = (template: string = "", data: Record<string, string> = {}): string => {
  if (!template) return "";

  return template.replace(/{{\s*([A-Za-z0-9_]+)\s*}}/g, (_, rawKey: string) => {
    const key = String(rawKey || "").trim();
    const candidates = [key, key.toUpperCase(), key.toLowerCase()];

    for (const candidate of candidates) {
      if (Object.prototype.hasOwnProperty.call(data, candidate) && data[candidate] !== undefined && data[candidate] !== null) {
        return String(data[candidate]);
      }

      const envValue = process.env[candidate];
      if (envValue !== undefined && envValue !== null) {
        return String(envValue);
      }
    }

    return "";
  });
};

export default parseTemplate;
