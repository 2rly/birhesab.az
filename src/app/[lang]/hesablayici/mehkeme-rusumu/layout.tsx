import { getCalculatorMetadata } from "@/lib/seo";

export const metadata = getCalculatorMetadata("mehkeme-rusumu");

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
