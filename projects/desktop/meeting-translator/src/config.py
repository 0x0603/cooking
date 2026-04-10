from __future__ import annotations

import os
import sys
from pathlib import Path
from dotenv import load_dotenv

# Search .env in multiple locations (app bundle, project dir, home dir)
_env_paths = [
    Path(getattr(sys, "_MEIPASS", "")) / ".env",
    Path(__file__).parent.parent / ".env",
    Path(__file__).parent / ".env",
    Path.home() / ".meeting-translator.env",
]
for p in _env_paths:
    if p.exists():
        load_dotenv(p)
        break
else:
    load_dotenv()

DEEPGRAM_API_KEY = os.getenv("DEEPGRAM_API_KEY", "")
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY", "")

# Audio settings
SAMPLE_RATE = 16000
CHANNELS = 1
DTYPE = "int16"

# Deepgram settings
DEEPGRAM_MODEL = "nova-2"
DEEPGRAM_LANGUAGE = "en"
DEEPGRAM_ENDPOINTING = 2500  # ms of silence before finalizing (longer = wait for full sentence)
DEEPGRAM_DIARIZE = False  # Distinguish different speakers

# Debounce settings
INTERIM_DEBOUNCE_MS = 500  # Only update interim display every 500ms
DEEPGRAM_KEYWORDS = [
    "Kubernetes:2", "Docker:2", "CI/CD:2", "API:2", "microservice:2",
    "pipeline:2", "deploy:2", "rollback:2", "endpoint:2", "serverless:2",
    "terraform:2", "helm:2", "Jira:2", "Confluence:2", "AWS:2", "GCP:2",
    "blockchain:2", "smart contract:2", "DeFi:2", "DEX:2", "CEX:2",
    "NFT:2", "tokenomics:2", "staking:2", "liquidity:2", "TVL:2",
    "airdrop:2", "on-chain:2", "off-chain:2", "mainnet:2", "testnet:2",
    "Solidity:2", "EVM:2", "Web3:2", "dApp:2", "Ethereum:2", "Solana:2",
    "Polygon:2", "Arbitrum:2", "Optimism:2", "oracle:2", "DAO:2",
    "solver:2", "intent:2", "order flow:2", "MEV:2", "frontrunning:2",
    "backrunning:2", "sandwich:2", "mempool:2", "searcher:2",
    "CoW Protocol:2", "UniswapX:2", "1inch Fusion:2", "batch auction:2",
]

# Translation settings
OPENAI_MODEL = "gpt-4o-mini"
TRANSLATION_SYSTEM_PROMPT = (
    "You are a real-time meeting translator for IT/software engineering meetings. "
    "Translate English to Vietnamese. "
    "Keep ALL technical terms in English: deploy, API, database, microservice, "
    "Kubernetes, Docker, CI/CD, pipeline, sprint, standup, pull request, merge, "
    "branch, commit, release, rollback, endpoint, payload, latency, throughput, "
    "cache, load balancer, frontend, backend, fullstack, framework, library, SDK, "
    "repository, cloud, serverless, container, cluster, node, pod, scaling, "
    "monitoring, logging, debugging, refactor, code review, tech debt, blocker, "
    "ticket, Jira, Confluence, Slack, AWS, GCP, Azure, terraform, helm, "
    "blockchain, smart contract, DeFi, DEX, CEX, NFT, token, tokenomics, "
    "wallet, gas fee, staking, yield, liquidity, TVL, APY, APR, airdrop, "
    "bridge, layer 1, layer 2, rollup, validator, consensus, PoS, PoW, "
    "on-chain, off-chain, mainnet, testnet, whitepaper, DAO, governance, "
    "mint, burn, swap, pool, vault, oracle, Solidity, EVM, Web3, dApp, "
    "Ethereum, Bitcoin, Solana, Polygon, Arbitrum, Optimism, Base. "
    "Be concise and natural. Only return the translation, nothing else."
)

VI_TO_EN_SYSTEM_PROMPT = (
    "You are a real-time meeting translator for IT/software engineering meetings. "
    "Translate Vietnamese to English. "
    "Keep technical terms in English. "
    "Use professional, natural English suitable for tech meetings. "
    "Only return the translation, nothing else."
)

# Cache for common phrases
TRANSLATION_CACHE: dict[str, str] = {
    "Any questions?": "Co cau hoi nao khong?",
    "Makes sense": "Hop ly",
    "Let's move on": "Chuyen sang phan tiep nhe",
    "Can you hear me?": "Moi nguoi nghe ro khong?",
    "You're on mute": "Ban dang bi tat mic",
    "Let me share my screen": "De minh chia se man hinh",
    "Sounds good": "Nghe on do",
    "I agree": "Minh dong y",
    "Go ahead": "Ban noi di",
    "One moment please": "Cho minh mot chut",
}

# UI settings
OVERLAY_MIN_WIDTH = 500
OVERLAY_MIN_HEIGHT = 250
OVERLAY_DEFAULT_WIDTH = 1000
OVERLAY_DEFAULT_HEIGHT = 1000
OVERLAY_OPACITY = 0.92
OVERLAY_FONT_SIZE_EN = 13
OVERLAY_FONT_SIZE_VI = 14
MAX_HISTORY_LINES = 50
