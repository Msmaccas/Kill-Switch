# Product Definition – KillSwitch

## Broad field

The broad domain is **financial decision support for active trading and discretionary portfolio management**.  Within this field there is a growing proliferation of research agents, market‑data bots and generative AI summarisation tools.  Most of these products focus on idea generation, signal hunting or execution automation.

## Subfield

KillSwitch operates in the **post‑research integrity monitoring** subfield.  It does not screen for new ideas or execute trades.  Instead it continuously monitors the *validity* of existing trading theses, ensuring that the reasons for entering a position remain intact and that exit decisions are grounded in pre‑defined logic.

## Specialised niche

Within integrity monitoring, KillSwitch targets the **thesis ledger and kill‑condition sentinel** niche.  This space is underserved: even sophisticated multi‑agent trading frameworks rarely enforce operator‑defined kill conditions or enforce structured reviews when market data contradicts the original rationale.  By contrast, KillSwitch provides a persistent memory of each thesis and a disciplined mechanism for surfacing soft and hard breaks.

## Job to be done

Active traders and portfolio managers must maintain a mental ledger of why each position exists and what would invalidate it.  During periods of market turbulence it is easy to rationalise away warning signs or forget the original rationale.  KillSwitch helps operators:

* **Record** the setup, catalyst, business and macro theses for each position along with explicit supports, kill conditions, review cadence and expected time horizon.
* **Monitor** incoming price action, news, filings and other events for contradictions or deteriorating supports.
* **Warn** when a thesis is drifting (soft break) or invalidated (hard break) so that the operator must consciously review or exit.
* **Audit** reasoning by storing a ledger of evidence and post‑mortem outcomes, allowing users to learn from past exits and refine their kill conditions.

## Core promise

KillSwitch promises to **protect traders from quiet thesis drift**.  It will never execute trades or make recommendations.  Instead it ensures that each position has a living thesis with enforceable kill conditions, continuously challenged by real‑time evidence, and that users cannot quietly rewrite history in their heads when markets move.

## Target user

* **Active discretionary traders** who manage their own portfolios and value process discipline.
* **Investment pods or family offices** with shared decision‑making processes and a need to document thesis rationale and exit rules.
* **Research teams** who want to link their upstream scanners or idea generators into a persistent thesis ledger and kill‑switch monitor.

## Maturity target

The initial release targets a **minimum viable product** that runs entirely locally using TypeScript and Node.js.  It includes a ledger, a workflow engine with deterministic agents, a simple API server, a worker daemon, tests, fixtures and documentation.  It is suitable for personal use or small teams.  Later releases could integrate with live market feeds, external research tools and multi‑user authentication.

## Why this should exist

Most trading tools either focus on finding ideas or executing orders.  Very few products enforce the crucial discipline of **maintaining and invalidating the thesis** once a trade is on.  Without such a system traders are prone to anchoring, confirmation bias and over‑staying winners or losers.  KillSwitch fills this gap by acting as a thesis integrity engine that is orthogonal to entry signals or execution.  It complements, rather than replaces, other agentic tools.

## First demo must prove

* Theses can be created with explicit supports, kill conditions, review cadences and horizons.
* Incoming evidence is normalised and stored with provenance metadata and explicit states.
* The workflow engine compares evidence against each thesis and produces soft or hard break events based on deterministic rules.
* The ranked board clearly surfaces which theses are drifting, which are broken and which are due for review.
* A complete smoke run demonstrates at least one thesis escalating to a soft break and another to a hard break using deterministic fixtures.

## Explicitly out of scope

* **Execution or order management.**  KillSwitch does not place, amend or cancel trades.
* **Recommendation or ranking of securities.**  The system does not suggest what to buy or sell.
* **High‑frequency or quantitative strategy backtesting.**  KillSwitch is not a backtester; it expects positions and thesis definitions to come from external sources.
* **Inference of hidden signals or user intent.**  All data used by KillSwitch must be supplied explicitly by providers or the user.  No guessing or data scraping is performed.