import { getCalculatorMetadata } from "@/lib/seo";

export const metadata = getCalculatorMetadata("ielts");

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
