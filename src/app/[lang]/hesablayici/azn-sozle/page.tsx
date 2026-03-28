"use client";

import { useState, useMemo } from "react";
import CalculatorLayout from "@/components/CalculatorLayout";
import { useLanguage } from "@/i18n";

const birler = ["", "bir", "iki", "üç", "dörd", "beş", "altı", "yeddi", "səkkiz", "doqquz"];
const onluqlar = ["", "on", "iyirmi", "otuz", "qırx", "əlli", "altmış", "yetmiş", "səksən", "doxsan"];

function convertHundreds(n: number): string {
  if (n === 0) return "";

  let result = "";

  const yuz = Math.floor(n / 100);
  const qalan = n % 100;
  const onluq = Math.floor(qalan / 10);
  const birlik = qalan % 10;

  if (yuz > 0) {
    result += (yuz === 1 ? "" : birler[yuz] + " ") + "yüz";
    if (qalan > 0) result += " ";
  }

  if (onluq > 0) {
    result += onluqlar[onluq];
    if (birlik > 0) result += " ";
  }

  if (birlik > 0) {
    result += birler[birlik];
  }

  return result;
}

function numberToWords(num: number): string {
  if (num === 0) return "sıfır";

  const parts: string[] = [];

  const milyard = Math.floor(num / 1_000_000_000);
  const milyon = Math.floor((num % 1_000_000_000) / 1_000_000);
  const min = Math.floor((num % 1_000_000) / 1_000);
  const yuz = Math.floor(num % 1_000);

  if (milyard > 0) {
    parts.push(convertHundreds(milyard) + " milyard");
  }

  if (milyon > 0) {
    parts.push(convertHundreds(milyon) + " milyon");
  }

  if (min > 0) {
    parts.push((min === 1 ? "bir" : convertHundreds(min)) + " min");
  }

  if (yuz > 0) {
    parts.push(convertHundreds(yuz));
  }

  return parts.join(" ");
}

function capitalize(str: string): string {
  if (!str) return str;
  return str.charAt(0).toUpperCase() + str.slice(1);
}

function convertToAznWords(value: number): string {
  const manat = Math.floor(value);
  const qepik = Math.round((value - manat) * 100);

  let result = "";

  if (manat > 0) {
    result = capitalize(numberToWords(manat)) + " manat";
  }

  if (qepik > 0) {
    const qepikText = numberToWords(qepik) + " qəpik";
    if (manat > 0) {
      result += " " + qepikText;
    } else {
      result = capitalize(qepikText);
    }
  }

  if (manat === 0 && qepik === 0) {
    result = "Sıfır manat";
  }

  return result;
}

const examples = [
  { value: 1500.5, label: "1 500,50" },
  { value: 25000, label: "25 000" },
  { value: 100.01, label: "100,01" },
  { value: 999999.99, label: "999 999,99" },
];

const pageTranslations = {
  az: {
    title: "AZN sözlə yazılışı",
    description: "Məbləği daxil edin — Azərbaycan dilində sözlə yazılışını əldə edin.",
    breadcrumbCategory: "Gündəlik",
    formulaTitle: "Məbləğin sözlə yazılışı qaydaları",
    formulaContent: `Azərbaycan dilində məbləğin sözlə yazılışı:
• Rəqəmlər: bir, iki, üç, dörd, beş, altı, yeddi, səkkiz, doqquz
• Onluqlar: on, iyirmi, otuz, qırx, əlli, altmış, yetmiş, səksən, doxsan
• Böyük rəqəmlər: yüz, min, milyon, milyard
• Valyuta: manat və qəpik

Məsələn: 1 547,32 → Bir min beş yüz qırx yeddi manat otuz iki qəpik`,
    amountLabel: "Məbləğ (AZN)",
    maxNote: "Maksimum: 999 999 999,99 AZN",
    writtenForm: "Sözlə yazılışı",
    copied: "Kopyalandı!",
    copy: "Kopyala",
    examples: "Nümunələr",
    emptyStateText: "Nəticəni görmək üçün məbləği daxil edin.",
  },
  en: {
    title: "AZN in words",
    description: "Enter an amount — get its written form in Azerbaijani language.",
    breadcrumbCategory: "Daily",
    formulaTitle: "Rules for writing amounts in words",
    formulaContent: `Writing amounts in words in Azerbaijani:
• Digits: bir, iki, üç, dörd, beş, altı, yeddi, səkkiz, doqquz
• Tens: on, iyirmi, otuz, qırx, əlli, altmış, yetmiş, səksən, doxsan
• Large numbers: yüz, min, milyon, milyard
• Currency: manat and qəpik

Example: 1 547.32 → Bir min beş yüz qırx yeddi manat otuz iki qəpik`,
    amountLabel: "Amount (AZN)",
    maxNote: "Maximum: 999,999,999.99 AZN",
    writtenForm: "Written form",
    copied: "Copied!",
    copy: "Copy",
    examples: "Examples",
    emptyStateText: "Enter an amount to see the result.",
  },
  ru: {
    title: "AZN прописью",
    description: "Введите сумму — получите её написание прописью на азербайджанском языке.",
    breadcrumbCategory: "Повседневное",
    formulaTitle: "Правила написания суммы прописью",
    formulaContent: `Написание суммы прописью на азербайджанском языке:
• Цифры: bir, iki, üç, dörd, beş, altı, yeddi, səkkiz, doqquz
• Десятки: on, iyirmi, otuz, qırx, əlli, altmış, yetmiş, səksən, doxsan
• Большие числа: yüz, min, milyon, milyard
• Валюта: manat и qəpik

Пример: 1 547,32 → Bir min beş yüz qırx yeddi manat otuz iki qəpik`,
    amountLabel: "Сумма (AZN)",
    maxNote: "Максимум: 999 999 999,99 AZN",
    writtenForm: "Прописью",
    copied: "Скопировано!",
    copy: "Копировать",
    examples: "Примеры",
    emptyStateText: "Введите сумму, чтобы увидеть результат.",
  },
};

export default function AznSozleCalculator() {
  const { lang } = useLanguage();
  const pt = pageTranslations[lang];

  const [amount, setAmount] = useState("");
  const [copied, setCopied] = useState(false);

  const result = useMemo(() => {
    const value = parseFloat(amount);
    if (isNaN(value) || value < 0 || value > 999999999.99) return null;
    return convertToAznWords(value);
  }, [amount]);

  const handleCopy = async () => {
    if (!result) return;
    try {
      await navigator.clipboard.writeText(result);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // fallback
    }
  };

  return (
    <CalculatorLayout
      title={pt.title}
      description={pt.description}
      breadcrumbs={[
        { label: pt.breadcrumbCategory, href: "/?category=daily" },
        { label: pt.title },
      ]}
      formulaTitle={pt.formulaTitle}
      formulaContent={pt.formulaContent}
      relatedIds={["percentage", "discount", "currency", "vat"]}
    >
      {/* Input */}
      <div className="mb-8">
        <label className="block text-sm font-medium text-foreground mb-2">
          💵 {pt.amountLabel}
        </label>
        <input
          type="number"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder="1547.32"
          min="0"
          max="999999999.99"
          step="0.01"
          className="w-full px-4 py-4 rounded-xl border border-border bg-white text-foreground placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-xl"
        />
        <p className="text-xs text-muted mt-1">{pt.maxNote}</p>
      </div>

      {/* Result */}
      {result ? (
        <div className="space-y-6">
          {/* Main Result Card */}
          <div className="bg-gradient-to-br from-primary to-primary-dark rounded-2xl p-6 text-white">
            <p className="text-sm text-blue-200 mb-2">{pt.writtenForm}</p>
            <p className="text-xl sm:text-2xl font-bold leading-relaxed">{result}</p>
          </div>

          {/* Copy Button */}
          <button
            onClick={handleCopy}
            className={`w-full py-3 rounded-xl font-medium transition-all ${
              copied
                ? "bg-green-100 text-green-700 border border-green-300"
                : "bg-gray-50 text-foreground border border-border hover:bg-gray-100"
            }`}
          >
            {copied ? pt.copied : `📋 ${pt.copy}`}
          </button>

          {/* Examples */}
          <div className="bg-white rounded-xl border border-border overflow-hidden">
            <div className="bg-gray-50 px-5 py-3 border-b border-border">
              <h3 className="font-semibold text-foreground flex items-center gap-2">
                <span>📝</span>
                {pt.examples}
              </h3>
            </div>
            <div className="divide-y divide-border">
              {examples.map((ex) => (
                <button
                  key={ex.value}
                  onClick={() => setAmount(ex.value.toString())}
                  className="w-full flex justify-between px-5 py-3 hover:bg-gray-50 transition-colors text-left"
                >
                  <span className="text-sm font-medium text-foreground">{ex.label} AZN</span>
                  <span className="text-sm text-muted">{convertToAznWords(ex.value)}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <div className="text-center py-8 text-muted">
          <span className="text-4xl block mb-3">🔤</span>
          <p>{pt.emptyStateText}</p>

          {/* Examples when no input */}
          <div className="mt-6 text-left">
            <div className="bg-white rounded-xl border border-border overflow-hidden">
              <div className="bg-gray-50 px-5 py-3 border-b border-border">
                <h3 className="font-semibold text-foreground flex items-center gap-2">
                  <span>📝</span>
                  {pt.examples}
                </h3>
              </div>
              <div className="divide-y divide-border">
                {examples.map((ex) => (
                  <button
                    key={ex.value}
                    onClick={() => setAmount(ex.value.toString())}
                    className="w-full flex justify-between px-5 py-3 hover:bg-gray-50 transition-colors text-left"
                  >
                    <span className="text-sm font-medium text-foreground">{ex.label} AZN</span>
                    <span className="text-sm text-muted">{convertToAznWords(ex.value)}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </CalculatorLayout>
  );
}
