import { getCalculatorMetadata } from "@/lib/seo";

export const metadata = getCalculatorMetadata("frilansci-vergi");

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
