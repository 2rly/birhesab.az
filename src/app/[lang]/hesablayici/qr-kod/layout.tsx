import { getCalculatorMetadata } from "@/lib/seo";

export const metadata = getCalculatorMetadata("qr-kod");

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
