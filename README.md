# Interpretive Orchestration

Not a tool for faster coding. A partner for deeper thinking.

Interpretive Orchestration is a plugin for AI agents that supports interpretive qualitative research. It helps you scale your analysis without giving up interpretive authority. You code the first documents yourself, then work with AI through visible reasoning, then build theory in dialogue with your research tradition.

The plugin is built for Claude Code. It also installs in OpenAI Codex, GitHub Copilot CLI and Kimi Code, with some parts missing on each. See [what works on each platform](#what-works-on-each-platform).

It puts into practice the framework in Lin and Corley (2026), ["Interpretive Orchestration"](https://doi.org/10.1177/14761270261448645), published in Strategic Organization.

- [Install the plugin](#install-the-plugin)
- [Set up from scratch](plugin/INSTALL.md), including Node.js, on Windows, macOS or Linux
- [Quick reference](plugin/QUICK-START.md)

## What the plugin does

Most AI tools for qualitative research treat AI as a faster way to code. You put data in, the AI processes it and you review the output. That speeds up the work, but it does not deepen it, and the assumptions behind the analysis stay hidden.

This plugin treats AI as a thinking partner instead. It asks questions that make your reasoning visible to you. It shows how it interpreted a passage, not only what it concluded. Final interpretive decisions stay with you.

The aim is to change how you think about interpretation, not only to speed up coding.

## How the 3 stages work

You and the AI both learn from the craft tradition of interpretive inquiry: rigor, reflexivity, theoretical sensitivity and interpretive depth. Neither directs the other. We call this the atelier of co-apprenticeship. Our earlier research called it the human-AI-human "sandwich".

| Stage | What happens | What the AI does |
|-------|--------------|------------------|
| 1. Solo practice | You code 10 to 15 documents by hand, write memos and develop an initial framework | Listens and asks questions, but does not code. AI cannot build your theoretical sensitivity for you. |
| 2. Collaboration | Parallel theoretical and empirical streams, synthesis and pattern characterization | Codes with you through 4-stage visible reasoning, using `@dialogical-coder` |
| 3. Dialogue with tradition | You examine your work through the questions your research tradition asks | Asks those questions, using `@scholarly-companion` |

The plugin checks that Stage 1 is complete before Stage 2 work starts. In Claude Code, if the AI starts a Stage 2 command or agent too early, Claude Code shows your Stage 1 progress and asks whether you want to go ahead. If you type a Stage 2 command yourself, the AI is told to show your progress and ask you instead. You can proceed if you have a reason, for example if you did Stage 1 on paper.

## Why the structure matters

This plugin puts Partnership Agency into practice. Partnership Agency comes from the [Cognitio Emergens](https://arxiv.org/abs/2505.03105) framework (Lin, 2025). In it, human and AI form one epistemic system that produces insights neither could reach alone.

Partnership Agency depends on 4 conditions:

- theoretical foundation: Stage 1 prevents the "calculator mindset", where AI becomes mere automation
- visible reasoning: the 4-stage process prevents black-box interpretation
- recursive evolution: human and AI both learn and adapt
- epistemic ambidexterity: you balance AI capability with human control

The structure is not a constraint. It is what makes the partnership possible. We offer one rigorous path, grounded in Cognitio Emergens and in the Gioia and constructivist traditions.

## Core principles

| Principle | What it means |
|-----------|---------------|
| Epistemic coherence | The plugin adapts to the philosophy you declare: your ontology, epistemology and grounded theory tradition |
| Reflexivity as strength | Prompts examine your assumptions to build awareness, not doubt |
| Human authority | The AI organizes and suggests. You interpret and decide. This does not change. |
| Visible reasoning | The 4-stage dialogical process shows how the AI interpreted a passage, not only what it concluded |
| Meta-cognition | Each interaction helps you think about how you think |
| Progressive depth | Philosophy deepens through practice, not through lectures at the start |

If you disagree with the AI, that is part of the method. The AI organizes possibilities. You make the interpretive judgments.

## How it differs from other tools

| Compared with | Their model | This plugin |
|---------------|-------------|-------------|
| CAQDAS tools such as NVivo and Atlas.ti | AI added to manual tools | AI built in, with human authority kept |
| General chat assistants | One-off prompts and no audit trail | A systematic 4-stage dialogical process with an audit trail |
| AI co-scientist systems | Full automation, mostly for STEM | Augmentation centered on the researcher, for social science |

The plugin treats epistemology as part of the user experience. It builds in meta-cognition, keeps the sandwich methodology in place and builds in reasoning tools.

## Expect some friction

The plugin puts reflection before speed. When it stops you, it is asking you to think.

It makes 3 trade-offs on purpose:

- transformation over reliability: it aims to change how you think, not only to process faster
- dialogue over determinism: Socratic onboarding adapts to you
- reflection over efficiency: interpretive pauses are part of the method, not bugs

If something feels heavy, that is deliberate. The friction prevents the calculator mindset.

## Install the plugin

You need Node.js 18 or later, because the plugin's scripts and checks run on Node. [Set up from scratch](plugin/INSTALL.md) explains how to install Node.js and Claude Code.

### Claude Code

Run these commands in Claude Code:

```
/plugin marketplace add linxule/interpretive-orchestration
/plugin install interpretive-orchestration@interpretive-orchestration
```

Then check your setup and start a project:

```
/qual-check-setup
/qual-init
```

To start from a ready-made workspace instead, use the [Interpretive Orchestration starter project](https://github.com/linxule/interpretive-orchestration-starter). It is a VS Code workspace with settings for people new to Claude Code.

### OpenAI Codex

Run these commands in a terminal:

```
codex plugin marketplace add linxule/interpretive-orchestration
codex plugin add interpretive-orchestration@interpretive-orchestration
```

Codex runs a plugin's hooks only after you trust them. The next time you start Codex, it asks you to review the new hooks: choose Trust all and continue. You can also do this later in `/hooks`. Codex asks again after each plugin update. Until you trust the hooks, the Stage 1 check and the session-start reminder do not run in Codex.

### GitHub Copilot CLI

Run these commands in a terminal:

```
copilot plugin marketplace add linxule/interpretive-orchestration
copilot plugin install interpretive-orchestration@interpretive-orchestration
```

### Kimi Code

Run this command in Kimi Code:

```
/plugins install https://github.com/linxule/interpretive-orchestration
```

## What works on each platform

Claude Code runs every part of the plugin. The other platforms run the same commands, skills and scripts. Their hooks work differently, so some checks behave differently there or are missing.

| Feature | Claude Code | Codex | Copilot CLI | Kimi Code |
|---------|-------------|-------|-------------|-----------|
| Commands, skills and Lotus Wisdom | Yes | Yes | Yes | Yes |
| Agents, such as `@dialogical-coder` | Yes | No, Codex plugins cannot include agents | Yes | Yes |
| Partnership principles and Stage 1 progress given to the AI at the start of each session | Yes | Yes, once you trust the hooks | Yes | Yes, with your first message, which you also see |
| Stage 1 check before Stage 2 work | Claude Code asks you when the AI starts the work. For a command you type, the AI is told to ask you | The AI is told to ask you when you name a Stage 2 command, once you trust the hooks | Same as Claude Code | The AI's call is held and it is told to ask you. It goes through once you have replied |
| Interpretive pause and coherence check after `@dialogical-coder` | Shown to you | No | The AI passes them on | Written to the conversation log only |
| Audit trail and phase transition after Stage 2 commands | Yes | No | No | Only when the AI starts the command, not when you type it |
| Session reflection | Written to the conversation log | Written to the conversation log | Written to the conversation log | Written to the conversation log when you exit |

Session reflection is never shown at the end of a session. `/qual-reflect` reads the log, tells you how many sessions have ended since your last reflection, and starts from the session-end questions.

Where the AI is told to ask you, nothing forces it to. In one test, the AI took the request for the work as your consent and went ahead until a hook held the call. Since 0.3.1, the instructions say that asking for the work is not consent, and in later tests the AI asked first. This still depends on the model. The start-of-session reminder works the same way.

The [next-version list](https://github.com/linxule/interpretive-orchestration/issues/4) tracks the gaps.

## Commands

Each platform writes the same command differently:

| Platform | How to run `/qual-init` |
|----------|-------------------------|
| Claude Code | `/qual-init` |
| Codex | `$interpretive-orchestration:qual-init` |
| Copilot CLI | `/interpretive-orchestration:qual-init` |
| Kimi Code | `/skill:interpretive-orchestration:qual-init` |

The commands:

| Group | Commands |
|-------|----------|
| Project | `/qual-init`, `/qual-status`, `/qual-check-setup`, `/qual-design`, `/qual-configure-analysis`, `/qual-advance-stage` |
| Stage 1 | `/qual-stage1-guide`, `/qual-memo`, `/qual-complete-stage1` |
| Stage 2 | `/qual-parallel-streams`, `/qual-synthesize`, `/qual-code-deductive`, `/qual-characterize-patterns` |
| Reflection | `/qual-reflect`, `/qual-think-through`, `/qual-wisdom-check`, `/qual-examine-assumptions` |

A typical sequence in Claude Code:

```
/qual-init                    # Socratic dialogue that establishes your philosophy
/qual-status                  # shows your Stage 1 progress
@dialogical-coder Code R01    # 4-stage reflexive coding, once Stage 1 is complete
/qual-think-through           # thinks deeply and step by step before responding
/qual-wisdom-check            # paradox navigation with Lotus Wisdom
```

## Skills

The plugin also has 12 skills. The AI loads a skill when your request matches it, so you do not need to call them by name.

| Skill | Use it for |
|-------|------------|
| `project-setup` | Socratic onboarding and project setup |
| `gioia-methodology` | building and checking a Gioia data structure |
| `coding-workflow` | managing systematic Stage 2 coding across documents |
| `analysis-orchestration` | model choice, cost estimates and batch processing |
| `project-dashboard` | progress and readiness |
| `methodological-rules` | case, wave and stream isolation rules, saturation tracking, branching and team coding |
| `coherence-check` | checking your language against your declared stance |
| `deep-reasoning` | thinking a hard decision through step by step |
| `paradox-navigation` | working through tensions with Lotus Wisdom |
| `literature-sweep` | finding and organizing literature for the theoretical stream |
| `interview-ingest` | converting interview audio, PDFs and documents |
| `document-conversion` | converting complex PDFs with tables and figures |

The [plugin guide](plugin/CLAUDE.md) lists the phrases that trigger each skill.

## Agents

| Agent | Stage | Role |
|-------|-------|------|
| `@stage1-listener` | 1 | A thinking partner that asks questions and never suggests codes |
| `@dialogical-coder` | 2 | Reflexive coding with 4-stage visible reasoning |
| `@research-configurator` | 2 | Technical setup without jargon |
| `@scholarly-companion` | 3 | Asks your tradition's questions about theoretical significance |

`@research-configurator` connects research goals to technical choices, for researchers who do not write code. It can help with:

- analysis strategy: sampling, checkpoints and framework maturity
- model selection, based on your needs
- thinking budgets: how deeply the AI reasons, and the trade-off between cost and quality
- batch processing: sequential, batch or parallel
- cost estimates per item and in total
- API setup, step by step, with no coding
- quality assessment that turns metrics into research signals
- human review: when to pause and what to examine
- troubleshooting that turns technical errors into methodological insights
- saturation monitoring: new concepts over time
- comparing different analytical approaches
- evidence-based refinements to your framework

For example: `@research-configurator Help me set up my analysis`

## Methodology checks

Hooks keep the methodology in place at the moments that matter. In Claude Code:

- at the start of each session in a research project, the AI gets the partnership principles and your Stage 1 progress
- before the AI starts Stage 2 work, the Stage 1 check shows your progress and asks whether to go ahead
- when you type a Stage 2 command yourself, the check tells the AI to show your progress and ask you
- after every 5 coded documents, an interpretive pause suggests reflection and a memo
- after `@dialogical-coder` finishes, a coherence check compares the language used with your declared stance
- once `/qual-synthesize` starts, the plugin keeps an audit trail in `outputs/audit-trail.md`, updated at the end of each AI reply
- after a stage or phase changes, the methodological rules update
- at the end of a session, the plugin records a reflection prompt in the conversation log

Other platforms run most of these checks. See [what works on each platform](#what-works-on-each-platform).

When a check stops you, it is asking you to think. [Hooks philosophy](plugin/docs/HOOKS-PHILOSOPHY.md) explains why each check exists.

## Reasoning and research tools

The plugin bundles one MCP server, [Lotus Wisdom](https://github.com/linxule/lotus-wisdom-mcp), for working through paradoxes (`/qual-wisdom-check`). It needs no API key. It runs on your machine, so your research data stays local, and it fetches the latest version each time it starts.

If you cannot run Node.js, you can connect the hosted Lotus Wisdom server at `https://lotus-wisdom-mcp.linxule.workers.dev/mcp` instead. The hosted server records usage analytics.

For step-by-step reasoning, `/qual-think-through` asks the AI to think deeply and step by step before it responds. Earlier versions used a Sequential Thinking MCP server for this. Version 0.3.0 removed it, because a prompt gives the same result.

Some skills can also use optional MCP servers that you add with your own API keys:

- MinerU, for parsing PDFs with complex tables and figures
- Jina AI, for fetching web articles
- Exa, for academic literature search
- Zen, for checking interpretations with several models
- Zotero, for bibliography management

Without them, those skills fall back to simpler methods. [Dependencies](plugin/DEPENDENCIES.md) explains how to set up each one.

## What the plugin creates in your project

`/qual-init` creates this structure:

```
your-project/
├── .interpretive-orchestration/
│   ├── epistemic-stance.md      # your philosophy, for you to read
│   ├── config.json              # settings, for the AI to read
│   ├── conversation-log.jsonl   # a record of AI activity, for transparency
│   └── reflexivity-journal.md   # your growth over time
│
├── stage1-foundation/           # human bread (top)
├── stage2-collaboration/        # human-AI filling
└── stage3-synthesis/            # human bread (bottom)
```

The folder structure teaches the methodology. The plugin is mostly prompts written in Markdown, with JavaScript for the checks and scripts. [Architecture](plugin/ARCHITECTURE.md) has the technical details.

## How your practice develops

| Phase | Focus | What the AI does |
|-------|-------|------------------|
| Foundation (week 1) | Socratic onboarding and Stage 1 manual coding | Watches and does not intervene |
| Deepening (week 4) | Stage 2 collaboration with `@dialogical-coder` | Reasons visibly in 4 stages |
| Partnership (week 12) | Stage 3 synthesis and dialogue about your own thinking | Asks your tradition's questions |

Philosophy deepens through practice, not through lectures at the start.

## The partnership agreement

| The AI commits to | You commit to |
|-------------------|---------------|
| Show its reasoning, not only its results | Complete the Stage 1 foundation |
| Express uncertainty honestly | Stay close to your data |
| Respect your interpretive authority | Question both the AI and your own assumptions |

Mutual commitment creates epistemic partnership.

## Methodological foundation

The plugin draws on practices we developed across several research projects. It brings together 6 methods:

- parallel discovery streams: theoretical and empirical streams that check each other
- dialogical prompting: 4-stage visible reasoning that prevents shallow coding
- interpretive pauses: after every 5 documents, at transitions and for edge cases
- pattern characterization: analyzing systematic variation rather than discovering essences
- multi-model triangulation: guards against the bias of any single AI
- sandwich architecture: human foundation, then collaboration, then human synthesis

Its philosophical basis is:

- the Gioia and Corley systematic interpretivist approach, by default
- Charmaz's constructivist reflexivity
- other coherent traditions, which you can configure

## Who it is for

The plugin is for qualitative researchers who want scale and interpretive depth, in grounded theory, phenomenology, narrative analysis and similar traditions.

It is not for people who want pure automation, or who do not want to engage with philosophical foundations.

## Documentation

| Start here | Go deeper |
|------------|-----------|
| [Set up from scratch](plugin/INSTALL.md) | [Design philosophy](plugin/DESIGN-PHILOSOPHY.md): why partnership |
| [Quick reference](plugin/QUICK-START.md) | [Architecture](plugin/ARCHITECTURE.md): technical details |
| [Troubleshooting](plugin/TROUBLESHOOTING.md) | [Plugin guide](plugin/CLAUDE.md): how the AI should behave |
| [Upgrade guide](plugin/UPGRADE-GUIDE.md) | [Dependencies](plugin/DEPENDENCIES.md): optional MCP servers |
| [Changelog](plugin/CHANGELOG.md) | [Hooks philosophy](plugin/docs/HOOKS-PHILOSOPHY.md): why each check exists |

To extend the plugin for your grounded theory tradition, build custom agents or contribute pattern modules, see [contributing](CONTRIBUTING.md).

## Cite this work

If you use this plugin in your research, please cite the article it puts into practice:

> Lin, X., & Corley, K. G. (2026). Interpretive Orchestration: An Essay Exploring the Epistemic Intersection of Human Intuition and Machine Intelligence. Strategic Organization. https://doi.org/10.1177/14761270261448645

The article is open access under CC BY 4.0. The "Cite this repository" button on GitHub gives the same citation in other formats.

The plugin is itself a research contribution. Using it means engaging with the method, not only the software.

## License

MIT. Epistemic infrastructure should be freely available.

## Acknowledgments

Theoretical foundations: [Cognitio Emergens](https://arxiv.org/abs/2505.03105) (Lin, 2025), Interpretive Orchestration (Lin and Corley, 2026), the Gioia and Corley methodology, and Charmaz's constructivist reflexivity.

Built by Xule Lin (SKEMA Business School) and Kevin Corley (Imperial College London).

AI collaborators: Claude (Anthropic), Codex (OpenAI), Gemini (Google) and Kimi (Moonshot AI).

This plugin is itself an instance of Partnership Agency: knowledge created through human-AI collaboration.

## Begin

```
/qual-init
```

Let's think together.
