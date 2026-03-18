# Kimi Code Plus 🚀

<p align="center">
  <strong>大道至简 — Simplicity is the ultimate sophistication.</strong><br>
  A high-precision AI engineering companion built for professional autonomy.
</p>

<p align="center">
  <a href="https://pypi.org/project/kimi-cli/"><img src="https://img.shields.io/pypi/v/kimi-cli?color=000000&labelColor=333333" alt="Version"></a>
  <a href="https://lihan0705.github.io/kimi-cli-plus/en/"><img src="https://img.shields.io/badge/Docs-English-000000?labelColor=333333" alt="Docs EN"></a>
  <a href="https://lihan0705.github.io/kimi-cli-plus/zh/"><img src="https://img.shields.io/badge/文档-中文-000000?labelColor=333333" alt="Docs ZH"></a>
</p>

---

## ☯️ The "Plus" Philosophy

Kimi Code Plus is not just a tool; it is a refinement of the interface between human intent and machine execution. We focus on removing the friction of configuration and the noise of complex UIs, adhering to the principle that **the best tool is the one that feels invisible.**

### 🔳 Multi-LLM Fabric
We've unified the configuration layer so you can treat different models as a single, fluid resource.
- **Unified Identity**: Manage multiple OpenAI-compatible providers (DeepSeek, GLM, local vLLM) simultaneously. No overwrites, just [Seamless CLI Switching](./docs/media/allURLmodel.png).
- **Intuitive Management**: A dedicated, monochrome [Web Dashboard](./docs/media/simpleurlmanage.png) to manage endpoints with the same elegance as your code.
- **Zero-Config Discovery**: Automatic `max_model_len` detection for vLLM—intelligence that stays out of your way.

### 🧠 Agentic Precision & Default Skills
Beyond raw prompting, we provide a structured cognitive layer designed for professional engineering.
- **Surgical Editing**: Enhanced tool validation logic ensures the agent "thinks twice, cuts once," delivering high-fidelity code mutations.
- **Default Skillset**: Built-in specialized behaviors for autonomous planning, research, and multi-file orchestration—ready out of the box.
- **Terminal Symbiosis**: [Real-time shell integration](./docs/media/shell-mode.gif) that empowers you to execute and observe without leaving the flow.

---

## 🚀 Key Capabilities

### ⚡ Shell Mode
Toggle `Ctrl-X` to run terminal commands directly in context.
<p align="center">
  <img src="./docs/media/shell-mode.gif" width="800" alt="Shell Mode">
</p>

- **🛠️ Autonomous Planning**: Sophisticated multi-step engineering and codebase analysis.
- **🔌 Deep Integration**: Native support for **VS Code**, **Zed**, and **MCP**.

---

## 📦 Quick Start

### 1. Installation
```bash
curl -LsSf https://raw.githubusercontent.com/lihan0705/kimi-cli-plus/main/scripts/install.sh | bash
```
*Requires Python 3.12+ and Node.js 22+.*

### 2. Configuration
Run `kimi` and use `/login` to name your provider (e.g., `deepseek`), add your URL, and start coding.

---

## 🛠️ Development

```bash
uv run kimi         # Local run
make build-web      # Build the enhanced UI
make check          # Quality check
```

<p align="center">
  <a href="https://github.com/lihan0705/kimi-cli-plus/issues">Report Issue</a> •
  <a href="https://github.com/lihan0705/kimi-cli-plus/blob/main/CONTRIBUTING.md">Contribute</a>
</p>
