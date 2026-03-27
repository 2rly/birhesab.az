"use client";

import { useState, useMemo } from "react";
import CalculatorLayout from "@/components/CalculatorLayout";
import { useLanguage } from "@/i18n";

const QUICK_TIPS = [5, 10, 15, 20];

function fmt(n: number): string {
  return n.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, " ");
}

const pageTranslations = {
  az: {
    title: "Bahsis hesablayıcısı",
    description: "Hesab mebleghine gore bahsis hesablayin ve nefer sayina bolun.",
    breadcrumbCategory: "Gundelik",
    formulaTitle: "Bahsis nece hesablanir?",
    formulaContent: `Bahsis meblegi = Hesab meblegi x (Bahsis % / 100)
Umumi meblegh = Hesab meblegi + Bahsis meblegi
Her nefere dusen = Umumi meblegh / Nefer sayi

Azerbaycanda bahsis enenesi:
- Restoranlar: 5-15% (meblegh hesaba daxil deyilse)
- Taksi: yuvarlaqlasdirma ve ya 5-10%
- Otel xidmetleri: 2-5 AZN`,
    billAmount: "Hesab meblegi (AZN)",
    tipPercent: "Bahsis faizi",
    customTipLabel: "Ve ya xususi faiz daxil edin:",
    customTipPlaceholder: "Xususi %",
    numPeople: "Nefer sayi",
    tipAmount: "Bahsis meblegi",
    totalAmount: "Umumi meblegh",
    perPerson: "Her nefere",
    perPersonUnit: "AZN / nefer",
    breakdownTitle: "Hesab bolguleri",
    billAmountLabel: "Hesab meblegi",
    tipLabel: "Bahsis",
    totalLabel: "Umumi",
    tipPerPerson: "Her nefere dusen bahsis",
    totalPerPerson: "Her nefere dusen umumi",
    comparisonTitle: "Sureli muqayise",
    compTip: "Bahsis:",
    compTotal: "Umumi:",
    compPerson: "Nefer:",
    emptyStateText: "Neticeni gormek ucun hesab mebleghini daxil edin.",
    people: "nefer",
  },
  en: {
    title: "Tip Calculator",
    description: "Calculate tip based on the bill amount and split between people.",
    breadcrumbCategory: "Daily",
    formulaTitle: "How is tip calculated?",
    formulaContent: `Tip amount = Bill amount x (Tip % / 100)
Total amount = Bill amount + Tip amount
Per person = Total amount / Number of people

Tipping customs in Azerbaijan:
- Restaurants: 5-15% (if not included in the bill)
- Taxi: rounding up or 5-10%
- Hotel services: 2-5 AZN`,
    billAmount: "Bill amount (AZN)",
    tipPercent: "Tip percentage",
    customTipLabel: "Or enter a custom percentage:",
    customTipPlaceholder: "Custom %",
    numPeople: "Number of people",
    tipAmount: "Tip amount",
    totalAmount: "Total amount",
    perPerson: "Per person",
    perPersonUnit: "AZN / person",
    breakdownTitle: "Bill breakdown",
    billAmountLabel: "Bill amount",
    tipLabel: "Tip",
    totalLabel: "Total",
    tipPerPerson: "Tip per person",
    totalPerPerson: "Total per person",
    comparisonTitle: "Quick comparison",
    compTip: "Tip:",
    compTotal: "Total:",
    compPerson: "Person:",
    emptyStateText: "Enter the bill amount to see the result.",
    people: "people",
  },
  ru: {
    title: "Калькулятор чаевых",
    description: "Рассчитайте чаевые по сумме счёта и разделите между людьми.",
    breadcrumbCategory: "Повседневное",
    formulaTitle: "Как рассчитываются чаевые?",
    formulaContent: `Сумма чаевых = Сумма счёта x (Чаевые % / 100)
Общая сумма = Сумма счёта + Сумма чаевых
На каждого = Общая сумма / Количество человек

Традиции чаевых в Азербайджане:
- Рестораны: 5-15% (если не включено в счёт)
- Такси: округление или 5-10%
- Гостиничные услуги: 2-5 AZN`,
    billAmount: "Сумма счёта (AZN)",
    tipPercent: "Процент чаевых",
    customTipLabel: "Или введите свой процент:",
    customTipPlaceholder: "Свой %",
    numPeople: "Количество человек",
    tipAmount: "Сумма чаевых",
    totalAmount: "Общая сумма",
    perPerson: "На каждого",
    perPersonUnit: "AZN / чел.",
    breakdownTitle: "Разбивка счёта",
    billAmountLabel: "Сумма счёта",
    tipLabel: "Чаевые",
    totalLabel: "Итого",
    tipPerPerson: "Чаевые на человека",
    totalPerPerson: "Итого на человека",
    comparisonTitle: "Быстрое сравнение",
    compTip: "Чаевые:",
    compTotal: "Итого:",
    compPerson: "На чел.:",
    emptyStateText: "Введите сумму счёта, чтобы увидеть результат.",
    people: "чел.",
  },
};

export default function TipCalculator() {
  const { lang } = useLanguage();
  const pt = pageTranslations[lang];

  const [billAmount, setBillAmount] = useState("");
  const [tipPercent, setTipPercent] = useState("10");
  const [customTip, setCustomTip] = useState("");
  const [numPeople, setNumPeople] = useState("1");

  const effectiveTip = customTip ? parseFloat(customTip) : parseFloat(tipPercent);

  const result = useMemo(() => {
    const bill = parseFloat(billAmount);
    const tip = effectiveTip;
    const people = parseInt(numPeople) || 1;

    if (!bill || bill <= 0 || !tip || tip < 0) return null;

    const tipAmount = bill * (tip / 100);
    const total = bill + tipAmount;
    const perPerson = total / people;
    const tipPerPerson = tipAmount / people;

    // Quick comparison
    const comparison = QUICK_TIPS.map((pct) => {
      const t = bill * (pct / 100);
      return {
        percent: pct,
        tipAmount: t,
        total: bill + t,
        perPerson: (bill + t) / people,
      };
    });

    return {
      bill,
      tipPercent: tip,
      tipAmount,
      total,
      perPerson,
      tipPerPerson,
      people,
      comparison,
    };
  }, [billAmount, effectiveTip, numPeople]);

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
      relatedIds={["discount", "percentage", "currency", "discount"]}
    >
      {/* Inputs */}
      <div className="space-y-6 mb-8">
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">{pt.billAmount}</label>
          <input
            type="number"
            value={billAmount}
            onChange={(e) => setBillAmount(e.target.value)}
            placeholder="100"
            min="0"
            className="w-full px-4 py-3 rounded-xl border border-border bg-white text-foreground placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-base"
          />
        </div>

        {/* Tip Percentage - Quick buttons */}
        <div>
          <label className="block text-sm font-medium text-foreground mb-3">{pt.tipPercent}</label>
          <div className="grid grid-cols-4 gap-3 mb-3">
            {QUICK_TIPS.map((pct) => (
              <button
                key={pct}
                onClick={() => {
                  setTipPercent(pct.toString());
                  setCustomTip("");
                }}
                className={`p-3 rounded-xl border text-center transition-all ${
                  !customTip && tipPercent === pct.toString()
                    ? "border-primary bg-primary-light ring-2 ring-primary"
                    : "border-border bg-white hover:border-primary/30"
                }`}
              >
                <p className="text-xl font-bold text-foreground">{pct}%</p>
              </button>
            ))}
          </div>
          <div>
            <label className="block text-xs text-muted mb-1">{pt.customTipLabel}</label>
            <input
              type="number"
              value={customTip}
              onChange={(e) => setCustomTip(e.target.value)}
              placeholder={pt.customTipPlaceholder}
              min="0"
              max="100"
              className="w-full px-4 py-3 rounded-xl border border-border bg-white text-foreground placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-base"
            />
          </div>
        </div>

        {/* Number of People */}
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">{pt.numPeople}</label>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setNumPeople(Math.max(1, (parseInt(numPeople) || 1) - 1).toString())}
              className="w-12 h-12 rounded-xl border border-border bg-white text-foreground font-bold text-lg hover:bg-gray-50 transition-colors"
            >
              -
            </button>
            <input
              type="number"
              value={numPeople}
              onChange={(e) => setNumPeople(e.target.value)}
              min="1"
              className="flex-1 px-4 py-3 rounded-xl border border-border bg-white text-foreground text-center font-bold text-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
            />
            <button
              onClick={() => setNumPeople(((parseInt(numPeople) || 1) + 1).toString())}
              className="w-12 h-12 rounded-xl border border-border bg-white text-foreground font-bold text-lg hover:bg-gray-50 transition-colors"
            >
              +
            </button>
          </div>
        </div>
      </div>

      {/* Results */}
      {result ? (
        <div className="space-y-6">
          {/* Main Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-amber-50 rounded-2xl border border-amber-200 p-6 text-center">
              <p className="text-sm text-amber-600 mb-1">{pt.tipAmount} ({result.tipPercent}%)</p>
              <p className="text-2xl font-bold text-amber-700">{fmt(result.tipAmount)}</p>
              <p className="text-xs text-amber-600 mt-1">AZN</p>
            </div>
            <div className="bg-gradient-to-br from-primary to-primary-dark rounded-2xl p-6 text-center text-white">
              <p className="text-sm text-blue-200 mb-1">{pt.totalAmount}</p>
              <p className="text-2xl font-bold">{fmt(result.total)}</p>
              <p className="text-xs text-blue-200 mt-1">AZN</p>
            </div>
            {result.people > 1 && (
              <div className="bg-green-50 rounded-2xl border border-green-200 p-6 text-center">
                <p className="text-sm text-green-600 mb-1">{pt.perPerson} ({result.people} {pt.people})</p>
                <p className="text-2xl font-bold text-green-700">{fmt(result.perPerson)}</p>
                <p className="text-xs text-green-600 mt-1">{pt.perPersonUnit}</p>
              </div>
            )}
          </div>

          {/* Breakdown */}
          <div className="bg-white rounded-xl border border-border overflow-hidden">
            <div className="bg-gray-50 px-5 py-3 border-b border-border">
              <h3 className="font-semibold text-foreground">{pt.breakdownTitle}</h3>
            </div>
            <div className="divide-y divide-border">
              <div className="flex justify-between px-5 py-3">
                <span className="text-sm text-muted">{pt.billAmountLabel}</span>
                <span className="text-sm font-medium text-foreground">{fmt(result.bill)} AZN</span>
              </div>
              <div className="flex justify-between px-5 py-3">
                <span className="text-sm text-muted">{pt.tipLabel} ({result.tipPercent}%)</span>
                <span className="text-sm font-medium text-amber-700">+{fmt(result.tipAmount)} AZN</span>
              </div>
              <div className="flex justify-between px-5 py-3 bg-blue-50">
                <span className="text-sm font-semibold text-primary">{pt.totalLabel}</span>
                <span className="text-sm font-bold text-primary">{fmt(result.total)} AZN</span>
              </div>
              {result.people > 1 && (
                <>
                  <div className="flex justify-between px-5 py-3">
                    <span className="text-sm text-muted">{pt.tipPerPerson}</span>
                    <span className="text-sm font-medium text-foreground">{fmt(result.tipPerPerson)} AZN</span>
                  </div>
                  <div className="flex justify-between px-5 py-3 bg-green-50">
                    <span className="text-sm font-semibold text-green-700">{pt.totalPerPerson}</span>
                    <span className="text-sm font-bold text-green-700">{fmt(result.perPerson)} AZN</span>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Quick Comparison */}
          <div className="bg-white rounded-xl border border-border overflow-hidden">
            <div className="bg-gray-50 px-5 py-3 border-b border-border">
              <h3 className="font-semibold text-foreground">{pt.comparisonTitle}</h3>
            </div>
            <div className="divide-y divide-border">
              {result.comparison.map((c) => {
                const isActive = c.percent === result.tipPercent;
                return (
                  <div key={c.percent} className={`flex items-center justify-between px-5 py-3 ${isActive ? "bg-primary-light" : ""}`}>
                    <span className="text-sm font-medium text-foreground">{c.percent}%</span>
                    <div className="flex gap-6 text-sm">
                      <span className="text-muted">{pt.compTip} <span className="font-medium text-amber-700">{fmt(c.tipAmount)}</span></span>
                      <span className="text-muted">{pt.compTotal} <span className="font-medium text-primary">{fmt(c.total)}</span></span>
                      {result.people > 1 && (
                        <span className="text-muted">{pt.compPerson} <span className="font-medium text-foreground">{fmt(c.perPerson)}</span></span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      ) : (
        <div className="text-center py-8 text-muted">
          <span className="text-4xl block mb-3">🍽️</span>
          <p>{pt.emptyStateText}</p>
        </div>
      )}
    </CalculatorLayout>
  );
}
