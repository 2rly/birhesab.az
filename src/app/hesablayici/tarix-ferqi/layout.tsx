import { getCalculatorMetadata } from "@/lib/seo";

export const metadata = getCalculatorMetadata("tarix-ferqi");

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
