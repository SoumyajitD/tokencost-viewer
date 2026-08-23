# ⚡ AI Token Cost & Model Comparison Index

> **Universal LLM Tokenization & Pricing Index** built with LiteLLM, FastAPI, and Figma's clean design system.

[![Python](https://img.shields.io/badge/Python-3.13%2B-blue.svg?style=flat&logo=python)](https://python.org)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.115%2B-009688.svg?style=flat&logo=fastapi)](https://fastapi.tiangolo.com)
[![LiteLLM](https://img.shields.io/badge/LiteLLM-1.83%2B-purple.svg?style=flat)](https://github.com/BerriAI/litellm)

---

## 🌟 Highlights

- **100% Offline Tokenizer**: Uses `litellm.token_counter` for local tokenization across 18+ models from Google, OpenAI, Anthropic, DeepSeek, and Groq with zero network calls and $0.00 cost.
- **Dynamic Multi-Currency Engine**: Defaults to **Indian Rupees (INR ₹)** with instant switching between USD ($), EUR (€), GBP (£), JPY (¥), CAD, AUD.
- **Figma Design Language**: Editor-clean monochrome frame, signature oversized pastel color blocks (Lime `#D2E823`, Cream `#FFF4E0`, Lilac `#E0D8F6`, Coral `#FFC4B4`), pill buttons (`border-radius: 9999px`), and clean Inter typography.
- **Single-File Architecture**: The backend is consolidated into a single clean `app.py` file with static assets in `static/`.
- **100% Mobile-Friendly**: Responsive layout across desktops, tablets, and mobile phones.

---

## 📁 Repository Structure

```
gemini-tokencost-viewer/
├── app.py              # Standalone FastAPI server & token cost engine
├── pyproject.toml      # Project dependencies (fastapi, litellm, uvicorn)
├── static/
│   ├── index.html      # Figma-styled single page UI
│   ├── style.css       # Figma design tokens & mobile responsive styles
│   └── app.js          # Dynamic UI controller & currency converter
└── README.md
```

---

## 🚀 Quickstart

### 1. Install Dependencies
```bash
uv sync
```

### 2. Run Web Application
```bash
uv run python app.py
```
Open **[http://127.0.0.1:8000](http://127.0.0.1:8000)** in your browser.

---

## 📄 License
MIT License.
