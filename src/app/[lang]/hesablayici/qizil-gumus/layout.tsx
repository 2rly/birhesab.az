import { getCalculatorMetadata } from "@/lib/seo";

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  return getCalculatorMetadata("qizil-gumus", lang);
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
