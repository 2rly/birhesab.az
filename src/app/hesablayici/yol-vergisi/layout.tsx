import { getCalculatorMetadata } from "@/lib/seo";

export const metadata = getCalculatorMetadata("yol-vergisi");

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
