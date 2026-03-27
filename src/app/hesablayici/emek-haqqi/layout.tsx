import { getCalculatorMetadata } from "@/lib/seo";

export const metadata = getCalculatorMetadata("emek-haqqi");

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
