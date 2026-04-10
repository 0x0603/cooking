from openai import AsyncOpenAI

from config import (
    OPENAI_API_KEY,
    OPENAI_MODEL,
    TRANSLATION_SYSTEM_PROMPT,
    TRANSLATION_CACHE,
    VI_TO_EN_SYSTEM_PROMPT,
)


class Translator:
    """Translates English text to Vietnamese using GPT-4o-mini."""

    def __init__(self):
        self.client = AsyncOpenAI(api_key=OPENAI_API_KEY)
        self.cache: dict[str, str] = dict(TRANSLATION_CACHE)

    async def translate(self, text: str) -> str:
        """Translate English text to Vietnamese. Uses cache if available."""
        normalized = text.strip()
        if not normalized:
            return ""

        if normalized in self.cache:
            return self.cache[normalized]

        response = await self.client.chat.completions.create(
            model=OPENAI_MODEL,
            messages=[
                {"role": "system", "content": TRANSLATION_SYSTEM_PROMPT},
                {"role": "user", "content": normalized},
            ],
            temperature=0.3,
            max_tokens=500,
        )

        translation = response.choices[0].message.content.strip()
        self.cache[normalized] = translation
        return translation

    async def translate_streaming(self, text: str, on_chunk: callable) -> str:
        """Translate with streaming response for faster first-token display."""
        normalized = text.strip()
        if not normalized:
            return ""

        if normalized in self.cache:
            on_chunk(self.cache[normalized])
            return self.cache[normalized]

        full_text = ""
        stream = await self.client.chat.completions.create(
            model=OPENAI_MODEL,
            messages=[
                {"role": "system", "content": TRANSLATION_SYSTEM_PROMPT},
                {"role": "user", "content": normalized},
            ],
            temperature=0.3,
            max_tokens=500,
            stream=True,
        )

        async for chunk in stream:
            delta = chunk.choices[0].delta.content
            if delta:
                full_text += delta
                on_chunk(full_text)

        self.cache[normalized] = full_text
        return full_text

    async def translate_vi_to_en(self, text: str) -> str:
        """Translate Vietnamese text to English."""
        normalized = text.strip()
        if not normalized:
            return ""

        response = await self.client.chat.completions.create(
            model=OPENAI_MODEL,
            messages=[
                {"role": "system", "content": VI_TO_EN_SYSTEM_PROMPT},
                {"role": "user", "content": normalized},
            ],
            temperature=0.3,
            max_tokens=500,
        )

        return response.choices[0].message.content.strip()
