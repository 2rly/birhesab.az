import { getCalculatorMetadata } from "@/lib/seo";

export const metadata = getCalculatorMetadata("analiq-mezuniyyeti");

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
