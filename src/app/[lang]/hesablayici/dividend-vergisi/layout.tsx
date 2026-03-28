import { getCalculatorMetadata } from "@/lib/seo";

export const metadata = getCalculatorMetadata("dividend-vergisi");

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
