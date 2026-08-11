"use client";

import { useState } from "react";
import { categories } from "@/data/calculators";
import { useLanguage } from "@/i18n";

export default function Footer() {
  const { t, localizedPath } = useLanguage();
  const [feedbackName, setFeedbackName] = useState("");
  const [feedbackMessage, setFeedbackMessage] = useState("");
  const [feedbackSent, setFeedbackSent] = useState(false);
  const [feedbackLoading, setFeedbackLoading] = useState(false);
  const [feedbackError, setFeedbackError] = useState(false);

  return (
    <footer id="about" className="bg-foreground text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 md:gap-10">
          {/* Brand */}
          <div className="md:col-span-4">
            <h3 className="text-2xl font-bold mb-3">
              <span className="text-emerald-400">Bir</span>Hesab
              <span className="text-sm text-emerald-500">.az</span>
            </h3>
            <p className="text-gray-400 text-sm leading-relaxed max-w-xs">
              {t.footerDescription}
            </p>
          </div>

          {/* Categories */}
          <div className="md:col-span-5">
            <h4 className="text-xs font-bold mb-4 text-gray-300 uppercase tracking-wider">
              {t.categories}
            </h4>
            <ul className="grid grid-cols-2 gap-x-4 gap-y-2.5">
              {categories
                .filter((c) => c.id !== "all")
                .map((cat) => (
                  <li key={cat.id}>
                    <a
                      href={localizedPath(`/?category=${cat.id}#calculators`)}
                      className="inline-flex items-center gap-2 text-sm text-gray-400 hover:text-emerald-400 transition-colors"
                    >
                      <span className="text-base leading-none">{cat.icon}</span>
                      <span>{t.categoryNames[cat.id as keyof typeof t.categoryNames] || cat.name}</span>
                    </a>
                  </li>
                ))}
            </ul>
          </div>

          {/* Contact */}
          <div className="md:col-span-3">
            <h4 className="text-xs font-bold mb-4 text-gray-300 uppercase tracking-wider">
              {t.contact}
            </h4>
            <p className="text-sm text-gray-400 leading-relaxed mb-3">
              {t.contactMessage}
            </p>
            <a
              href="mailto:info@birhesab.az"
              className="inline-flex items-center gap-2 text-sm text-emerald-400 hover:text-emerald-300 transition-colors font-medium"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              info@birhesab.az
            </a>
          </div>
        </div>

        {/* Təklif və iradlar forması */}
        <div className="border-t border-gray-700 mt-8 pt-8">
          <div className="max-w-xl mx-auto text-center mb-8">
            <h4 className="font-semibold text-gray-200 mb-2 flex items-center justify-center gap-2">
              <svg className="w-5 h-5 text-emerald-400" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
              </svg>
              {t.feedbackTitle}
            </h4>
            <p className="text-xs text-gray-500 mb-4">{t.feedbackDesc}</p>
            {feedbackSent ? (
              <div className="bg-emerald-900/30 border border-emerald-700/50 rounded-xl p-4 text-sm text-emerald-400">
                {t.feedbackSuccess}
              </div>
            ) : (
              <form
                onSubmit={async (e) => {
                  e.preventDefault();
                  setFeedbackLoading(true);
                  setFeedbackError(false);
                  try {
                    const res = await fetch("https://formsubmit.co/ajax/info@birhesab.az", {
                      method: "POST",
                      headers: { "Content-Type": "application/json", Accept: "application/json" },
                      body: JSON.stringify({
                        name: feedbackName || "Anonim",
                        message: feedbackMessage,
                        _subject: "BirHesab.az — Təklif/İrad",
                      }),
                    });
                    if (res.ok) {
                      setFeedbackSent(true);
                      setFeedbackName("");
                      setFeedbackMessage("");
                    } else {
                      setFeedbackError(true);
                    }
                  } catch {
                    setFeedbackError(true);
                  } finally {
                    setFeedbackLoading(false);
                  }
                }}
                className="space-y-3"
              >
                <input
                  type="text"
                  value={feedbackName}
                  onChange={(e) => setFeedbackName(e.target.value)}
                  placeholder={t.feedbackNamePlaceholder}
                  className="w-full px-4 py-2.5 rounded-xl bg-gray-800 border border-gray-700 text-sm text-white placeholder:text-gray-500 focus:outline-none focus:border-emerald-500 transition-colors"
                />
                <textarea
                  value={feedbackMessage}
                  onChange={(e) => setFeedbackMessage(e.target.value)}
                  placeholder={t.feedbackPlaceholder}
                  rows={3}
                  required
                  className="w-full px-4 py-2.5 rounded-xl bg-gray-800 border border-gray-700 text-sm text-white placeholder:text-gray-500 focus:outline-none focus:border-emerald-500 transition-colors resize-none"
                />
                {feedbackError && (
                  <p className="text-xs text-red-400">{t.feedbackError}</p>
                )}
                <button
                  type="submit"
                  disabled={feedbackLoading}
                  className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white text-sm font-medium transition-colors"
                >
                  {feedbackLoading ? "..." : t.feedbackSend}
                </button>
              </form>
            )}
          </div>
        </div>

        <div className="border-t border-gray-700 mt-0 pt-8 text-center">
          <p className="text-sm text-gray-500">
            © {new Date().getFullYear()} {t.copyright}
          </p>
        </div>
      </div>
    </footer>
  );
}
