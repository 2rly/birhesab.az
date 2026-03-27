import { getCalculatorMetadata } from "@/lib/seo";

export const metadata = getCalculatorMetadata("yasam-sigortasi");

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
