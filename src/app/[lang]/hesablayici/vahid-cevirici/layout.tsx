import { getCalculatorMetadata } from "@/lib/seo";

export const metadata = getCalculatorMetadata("vahid-cevirici");

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
