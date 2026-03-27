import { getCalculatorMetadata } from "@/lib/seo";

export const metadata = getCalculatorMetadata("bahsis");

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
