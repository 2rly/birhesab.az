import { getCalculatorMetadata } from "@/lib/seo";

export const metadata = getCalculatorMetadata("depozit-vergisi");

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
