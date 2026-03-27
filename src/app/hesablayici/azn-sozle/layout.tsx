import { getCalculatorMetadata } from "@/lib/seo";

export const metadata = getCalculatorMetadata("azn-sozle");

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
