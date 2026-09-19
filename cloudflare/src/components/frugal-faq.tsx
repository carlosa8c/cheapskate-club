import React, { useState } from "react";

interface FaqItem {
  question: string;
  answer: React.ReactNode;
}

export function FrugalFaq() {
  const [openIdx, setOpenIdx] = useState<number | null>(0);

  const toggle = (idx: number) => {
    setOpenIdx(openIdx === idx ? null : idx);
  };

  const faqs: FaqItem[] = [
    {
      question: "How can autonomous agent compute really be $0.00? What's the catch?",
      answer: (
        <>
          <p>
            There is no catch and no hidden bill. Top inference providers (Google AI Studio, GroqCloud, Cerebras) offer generous free developer tiers with high rate limits (e.g. 15 requests per minute, 1,500 per day) to encourage adoption.
          </p>
          <p>
            Traditional agent tools either force a $20–$200/mo subscription or burn expensive proprietary tokens indiscriminately. cheapoS uses prompt caching, change-scoped diffing, and intelligent model handoffs (e.g. Gemini 2.5 Flash for planning + Groq Llama 3.3 70B for review) so the entire development loop fits inside free quotas.
          </p>
        </>
      ),
    },
    {
      question: "Does my private code or prompt data get sent to cheapoS servers?",
      answer: (
        <>
          <p>
            <strong>100% No.</strong> cheapoS is local-first software. Your files, git repositories, workspace trees, and unit test outputs are read and executed entirely inside your local macOS or Linux environment.
          </p>
          <p>
            The web companion at <code>cheapos.lol</code> only receives anonymous token numbers and installation signatures if you explicitly choose to connect and participate in the Leaderboard.
          </p>
        </>
      ),
    },
    {
      question: "What is the 10-Project Showcase baseline on the Community Workbench?",
      answer: (
        <>
          <p>
            The Workbench is not a feed for routine micro-fixes, typo corrections, or iterative prompt chatter. Those belong in your local development loop.
          </p>
          <p>
            Every project on the Workbench represents a finished product on GitHub built end-to-end in cheapoS in a single task run—backed by a public repository, a working README, and deterministic unit tests (like SnipVault, MicroCRM, and FeedCurator).
          </p>
        </>
      ),
    },
    {
      question: "How does cheapoS prevent model hallucinations and broken code?",
      answer: (
        <>
          <p>
            cheapos operates on a dual-model cooperative architecture: a fast autonomous worker generates solutions, and an independent reviewer model challenges the plan before code is committed.
          </p>
          <p>
            Crucially, cheapoS runs local deterministic unit tests (e.g. <code>python3 -m unittest</code> or <code>node --test</code>) in your local environment. If a test fails, cheapoS auto-corrects in a self-healing loop until all assertions pass.
          </p>
        </>
      ),
    },
  ];

  return (
    <section className="faq-section" aria-label="Frequently Asked Questions">
      <div className="faq-header">
        <div className="eyebrow">
          <span className="little-spark" aria-hidden="true">✳</span>
          NO BULLSHIT · COMPLETE TRANSPARENCY
        </div>
        <h2>The Frugal Manifesto & FAQ</h2>
        <p>
          Everything you need to know about autonomous software development with zero subscription tax.
        </p>
      </div>

      <div className="faq-list">
        {faqs.map((item, idx) => {
          const isOpen = openIdx === idx;
          return (
            <div key={item.question} className={`faq-item ${isOpen ? "open" : ""}`}>
              <button
                type="button"
                className="faq-trigger"
                onClick={() => toggle(idx)}
                aria-expanded={isOpen}
              >
                <span>{item.question}</span>
                <span className="faq-chevron" aria-hidden="true">
                  ▼
                </span>
              </button>
              {isOpen && <div className="faq-answer">{item.answer}</div>}
            </div>
          );
        })}
      </div>
    </section>
  );
}
