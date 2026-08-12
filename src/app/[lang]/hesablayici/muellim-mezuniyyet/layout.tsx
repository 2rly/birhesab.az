import { getCalculatorMetadata } from "@/lib/seo";

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  return getCalculatorMetadata("muellim-mezuniyyet", lang);
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
