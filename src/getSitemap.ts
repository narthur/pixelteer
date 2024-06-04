export default async function getSitemap(url: string): Promise<string[]> {
  const response = await fetch(`${url}/sitemap-0.xml`);
  if (!response.ok) {
    throw new Error(`Failed to fetch sitemap: ${response.statusText}`);
  }
  const xml: string = await response.text();

  return xml.match(/<loc>(.*?)<\/loc>/g)?.map((url) => url.slice(5, -6)) ?? [];
}
