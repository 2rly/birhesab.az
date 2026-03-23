import Link from "next/link";
import { categories } from "@/data/calculators";

export default function Footer() {
  return (
    <footer id="about" className="bg-foreground text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="text-xl font-bold mb-2">
              <span className="text-emerald-400">Bir</span>Hesab
              <span className="text-sm text-emerald-500">.az</span>
            </h3>
            <p className="text-gray-400 text-sm leading-relaxed">
              Bütün hesablamalar bir yerdə. Azərbaycanın ən geniş onlayn hesablayıcı platforması.
            </p>
          </div>

          <div>
            <h4 className="font-semibold mb-3 text-gray-300">Kateqoriyalar</h4>
            <ul className="space-y-2">
              {categories
                .filter((c) => c.id !== "all")
                .map((cat) => (
                  <li key={cat.id}>
                    <Link
                      href={`/?category=${cat.id}`}
                      className="text-sm text-gray-400 hover:text-white transition-colors"
                    >
                      {cat.icon} {cat.name}
                    </Link>
                  </li>
                ))}
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-3 text-gray-300">Əlaqə</h4>
            <p className="text-sm text-gray-400">
              Təklif və iradlarınız üçün bizimlə əlaqə saxlayın.
            </p>
            <p className="text-sm text-gray-400 mt-2">info@birhesab.az</p>
          </div>
        </div>

        <div className="border-t border-gray-700 mt-8 pt-8 text-center">
          <p className="text-sm text-gray-500">
            © {new Date().getFullYear()} BirHesab.az — Bütün hüquqlar qorunur.
          </p>
        </div>
      </div>
    </footer>
  );
}
