import { getCalculatorMetadata } from "@/lib/seo";

export const metadata = getCalculatorMetadata("kiraye-gelir-vergisi");

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
