export function extractPublicId(url: string): string | null {
  try {
    const regex = /\/upload\/(?:v\d+\/)?(.+)\.pdf$/;
    const match = url.match(regex);
    return match ? match[1] : null;
  } catch {
    return null;
  }
}
