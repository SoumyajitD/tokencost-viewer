"""
TokenCost - compares token costs across LLM providers.
Uses LiteLLM for tokenization and live exchange rates for currency conversion.
"""
from __future__ import annotations
import math, os, time, json, urllib.request
from typing import Dict, List, Any

import litellm
import uvicorn
from fastapi import FastAPI, HTTPException
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

PRICING_LAST_VERIFIED = "2026-08-22"

# model catalog - pricing in USD per 1M tokens
MODELS: List[Dict[str, Any]] = [
    # gemini
    {"id": "gemini-2.5-pro",      "name": "Gemini 2.5 Pro",       "provider": "Google",    "litellm_model": "gemini/gemini-2.5-pro",    "in_1m": 1.25,  "out_1m": 5.00,   "status": "current"},
    {"id": "gemini-2.5-flash",    "name": "Gemini 2.5 Flash",     "provider": "Google",    "litellm_model": "gemini/gemini-2.5-flash",  "in_1m": 0.15,  "out_1m": 0.60,   "status": "current"},
    # openai
    {"id": "gpt-4o",              "name": "GPT-4o",               "provider": "OpenAI",    "litellm_model": "gpt-4o",                   "in_1m": 2.50,  "out_1m": 10.00,  "status": "current"},
    {"id": "gpt-4o-mini",         "name": "GPT-4o mini",          "provider": "OpenAI",    "litellm_model": "gpt-4o-mini",              "in_1m": 0.15,  "out_1m": 0.60,   "status": "current"},
    {"id": "o3-mini",             "name": "o3-mini",              "provider": "OpenAI",    "litellm_model": "o3-mini",                  "in_1m": 1.10,  "out_1m": 4.40,   "status": "current"},
    {"id": "o1",                  "name": "o1",                   "provider": "OpenAI",    "litellm_model": "o1",                       "in_1m": 15.00, "out_1m": 60.00,  "status": "current"},
    {"id": "gpt-4.5-preview",     "name": "GPT-4.5 Preview",      "provider": "OpenAI",    "litellm_model": "gpt-4.5-preview",          "in_1m": 75.00, "out_1m": 150.00, "status": "current"},
    # anthropic
    {"id": "claude-3-7-sonnet",   "name": "Claude 3.7 Sonnet",    "provider": "Anthropic", "litellm_model": "claude-3-7-sonnet-20250219",  "in_1m": 3.00,  "out_1m": 15.00, "status": "current"},
    {"id": "claude-3-5-sonnet",   "name": "Claude 3.5 Sonnet",    "provider": "Anthropic", "litellm_model": "claude-3-5-sonnet-20241022",  "in_1m": 3.00,  "out_1m": 15.00, "status": "current"},
    {"id": "claude-3-5-haiku",    "name": "Claude 3.5 Haiku",     "provider": "Anthropic", "litellm_model": "claude-3-5-haiku-20241022",   "in_1m": 0.80,  "out_1m": 4.00,  "status": "current"},
    # deepseek
    {"id": "deepseek-v3",         "name": "DeepSeek-V3",          "provider": "DeepSeek",      "litellm_model": "deepseek/deepseek-chat",      "in_1m": 0.27, "out_1m": 1.10, "status": "current"},
    {"id": "deepseek-r1",         "name": "DeepSeek-R1",          "provider": "DeepSeek",      "litellm_model": "deepseek/deepseek-reasoner",  "in_1m": 0.55, "out_1m": 2.19, "status": "current"},
    # groq hosted
    {"id": "llama-3.3-70b-groq",  "name": "Llama 3.3 70B (Groq)", "provider": "Meta / Groq",   "litellm_model": "groq/llama-3.3-70b-versatile",  "in_1m": 0.59, "out_1m": 0.79, "status": "current"},
    {"id": "mistral-large-2",     "name": "Mistral Large 2",      "provider": "Mistral AI",    "litellm_model": "mistral/mistral-large-latest",   "in_1m": 2.00, "out_1m": 6.00, "status": "current"},
    {"id": "qwen-2.5-72b",        "name": "Qwen 2.5 72B (Groq)",  "provider": "Alibaba / Groq","litellm_model": "groq/qwen-2.5-72b-instruct",    "in_1m": 0.59, "out_1m": 0.79, "status": "current"},
]

# fallback rates (used if API is down)
CURRENCIES: Dict[str, Dict[str, Any]] = {
    "INR": {"symbol": "\u20b9", "rate": 95.75, "name": "Indian Rupee"},
    "USD": {"symbol": "$",  "rate": 1.00,  "name": "US Dollar"},
    "EUR": {"symbol": "\u20ac", "rate": 0.95,  "name": "Euro"},
    "GBP": {"symbol": "\u00a3", "rate": 0.79,  "name": "British Pound"},
    "JPY": {"symbol": "\u00a5", "rate": 154.50,"name": "Japanese Yen"},
    "CAD": {"symbol": "CA$","rate": 1.42,  "name": "Canadian Dollar"},
    "AUD": {"symbol": "A$", "rate": 1.58,  "name": "Australian Dollar"},
}

_rates_cache = {"ts": 0.0, "data": None}
_token_cache: Dict[str, int] = {}


def fetch_live_rates() -> Dict[str, float]:
    """Grab live USD rates, cache for 1h."""
    now = time.time()
    if _rates_cache["data"] and (now - _rates_cache["ts"] < 3600):
        return _rates_cache["data"]

    apis = [
        "https://open.er-api.com/v6/latest/USD",
        "https://api.exchangerate-api.com/v4/latest/USD",
    ]
    for url in apis:
        try:
            req = urllib.request.Request(url, headers={"User-Agent": "TokenCost/2.0"})
            with urllib.request.urlopen(req, timeout=3.5) as resp:
                body = json.loads(resp.read().decode())
                rates = body.get("rates", {})
                if rates and "INR" in rates:
                    for code in CURRENCIES:
                        if code in rates:
                            CURRENCIES[code]["rate"] = round(float(rates[code]), 4)
                    _rates_cache["ts"] = now
                    _rates_cache["data"] = {k: CURRENCIES[k]["rate"] for k in CURRENCIES}
                    return _rates_cache["data"]
        except Exception:
            continue

    # fallback
    return {k: CURRENCIES[k]["rate"] for k in CURRENCIES}


def count_tokens(model: str, text: str) -> int:
    """Count tokens via LiteLLM, falls back to gpt-4o tokenizer then char estimate."""
    if not text:
        return 0

    key = f"{model}:{hash(text)}"
    if key in _token_cache:
        return _token_cache[key]

    for m in [model, "gpt-4o"]:
        try:
            n = litellm.token_counter(model=m, text=text)
            _token_cache[key] = n
            return n
        except Exception:
            pass

    n = max(1, math.ceil(len(text) / 3.8))
    _token_cache[key] = n
    return n


# app setup
app = FastAPI(title="TokenCost", version="2.0.0")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], allow_credentials=True,
    allow_methods=["*"], allow_headers=["*"],
)

@app.middleware("http")
async def add_no_cache_header(request, call_next):
    response = await call_next(request)
    response.headers["Cache-Control"] = "no-cache, no-store, must-revalidate, max-age=0"
    response.headers["Pragma"] = "no-cache"
    response.headers["Expires"] = "0"
    return response


class CalculateRequest(BaseModel):
    text: str = Field(..., description="Prompt text to tokenize")
    estimated_output_tokens: int = Field(500, ge=0, le=128000)
    currency_code: str = Field("INR")


@app.get("/api/rates")
async def get_rates():
    rates = fetch_live_rates()
    return {"base": "USD", "rates": rates, "inr_rate": rates.get("INR", 95.75)}


@app.post("/api/calculate")
async def calculate(req: CalculateRequest):
    try:
        fetch_live_rates()
        curr = CURRENCIES.get(req.currency_code.upper(), CURRENCIES["INR"])
        rate = curr["rate"]
        sym = curr["symbol"]

        ref_tokens = count_tokens("gpt-4o", req.text) if req.text.strip() else 0
        est_out = req.estimated_output_tokens

        results = []
        for m in MODELS:
            in_tok = count_tokens(m["litellm_model"], req.text) if req.text.strip() else 0

            in_usd = (in_tok / 1e6) * m["in_1m"]
            out_usd = (est_out / 1e6) * m["out_1m"]
            per_run = (in_usd + out_usd) * rate

            results.append({
                "id": m["id"],
                "name": m["name"],
                "provider": m["provider"],
                "status": m["status"],
                "input_tokens": in_tok,
                "output_tokens": est_out,
                "cost_1_run": per_run,
                "cost_1k_runs": per_run * 1000,
            })

        results.sort(key=lambda r: r["cost_1_run"])

        gpt4o = next((r for r in results if r["id"] == "gpt-4o"), None)
        cheapest = results[0] if results else None

        # compute savings vs gpt-4o
        for r in results:
            if gpt4o and gpt4o["cost_1_run"] > 0:
                pct = (gpt4o["cost_1_run"] - r["cost_1_run"]) / gpt4o["cost_1_run"] * 100
                r["vs_gpt4o_pct"] = round(pct, 1)
            else:
                r["vs_gpt4o_pct"] = 0.0

        return {
            "text_stats": {
                "char_count": len(req.text),
                "word_count": len(req.text.split()) if req.text.strip() else 0,
                "reference_input_tokens": ref_tokens,
            },
            "parameters": {"estimated_output_tokens": est_out},
            "models": results,
            "highlights": {"cheapest": cheapest, "flagship": gpt4o},
            "currency": {"symbol": sym, "code": req.currency_code.upper(), "rate_vs_usd": rate},
            "pricing_last_verified": PRICING_LAST_VERIFIED,
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# serve frontend
static_dir = os.path.join(os.path.dirname(__file__), "static")
os.makedirs(static_dir, exist_ok=True)
app.mount("/", StaticFiles(directory=static_dir, html=True), name="static")

if __name__ == "__main__":
    print("TokenCost v2.0 → http://127.0.0.1:8000")
    uvicorn.run("app:app", host="127.0.0.1", port=8000, reload=True)
