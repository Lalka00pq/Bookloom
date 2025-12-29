from __future__ import annotations

import json
from abc import ABC, abstractmethod
from typing import List

import httpx

from app.core.config import GeminiSettings
from app.core.logging import get_logger
from app.schemas.graph import Graph
from app.schemas.recommendations import (
    BookRecommendation,
    RecommendationsResponse,
)


class IRecommendationService(ABC):
    """Интерфейс сервиса рекомендаций (SOLID: ISP + DIP)."""

    @abstractmethod
    async def get_recommendations(
        self,
        *,
        user_id: str,
        graph: Graph,
        limit: int,
    ) -> RecommendationsResponse:
        """Получить рекомендации для пользователя на основе графа."""
        raise NotImplementedError


class GeminiRecommendationService(IRecommendationService):
    """
    Реализация сервиса рекомендаций через Google Gemini.

    Сервис:
    - асинхронный (httpx.AsyncClient),
    - изолирован от FastAPI (легко тестировать и масштабировать),
    - использует конфиг GeminiSettings.
    """

    def __init__(self, settings: GeminiSettings | None = None) -> None:
        self._settings = settings or GeminiSettings()
        self._logger = get_logger(self.__class__.__name__)

    async def get_recommendations(
        self,
        *,
        user_id: str,
        graph: Graph,
        limit: int,
    ) -> RecommendationsResponse:
        self._logger.info(
            "Requesting recommendations from Gemini",
            user_id=user_id,
            limit=limit,
            nodes_count=len(graph.nodes),
            edges_count=len(graph.edges),
        )

        prompt = self._build_prompt(user_id=user_id, graph=graph, limit=limit)

        url = (
            f"{self._settings.api_url}/"
            f"{self._settings.model_name}:generateContent"
        )
        params = {"key": self._settings.api_key}
        payload = {
            "contents": [
                {
                    "parts": [
                        {
                            "text": prompt,
                        }
                    ]
                }
            ]
        }

        async with httpx.AsyncClient(timeout=self._settings.timeout) as client:
            response = await client.post(url, params=params, json=payload)
            response.raise_for_status()
            data = response.json()

        recommendations = self._parse_response(
            data=data,
            user_id=user_id,
        )

        self._logger.info(
            "Recommendations received from Gemini",
            user_id=user_id,
            recommendations_count=len(recommendations.recommendations),
        )

        return recommendations

    def _build_prompt(self, *, user_id: str, graph: Graph, limit: int) -> str:
        """
        Строим промпт: передаём структуру графа и просим вернуть чистый JSON.
        """
        graph_payload = graph.model_dump()
        instruction = {
            "instruction": (
                "Ты система рекомендаций книг. "
                "Анализируй граф прочитанных и связанных книг пользователя "
                "и верни рекомендации ТОЛЬКО в виде валидного JSON без "
                "поясняющего текста. Формат ответа (не использовать разметку Markdown, ответ только JSON):\n\n"
                "{\n"
                '  "recommendations": [\n'
                "    {\n"
                '      "book_id": "optional_internal_id_or_null",\n'
                '      "title": "Название книги",\n'
                '      "author": "Автор или null",\n'
                '      "reason": "Причина рекомендации",\n'
                '      "score": 0.0-1.0,\n'
                '      "metadata": { "genre": "...", "tags": ["..."] }\n'
                "    }\n"
                "  ]\n"
                "}\n\n"
                f"Максимальное количество рекомендаций: {limit}."
            ),
            "user_id": user_id,
            "graph": graph_payload,
        }
        return json.dumps(instruction, ensure_ascii=False)

    def _parse_response(
        self,
        *,
        data: dict,
        user_id: str,
    ) -> RecommendationsResponse:
        """
        Разбор ответа Gemini.

        Ожидаем, что модель вернула текст, внутри которого чистый JSON
        вышеописанного формата. Если формат не совпадает, логируем и пробрасываем ошибку.
        """
        try:
            text = (
                data["candidates"][0]["content"]["parts"][0]["text"]
            )
        except (KeyError, IndexError) as exc:
            self._logger.error(
                "Unexpected Gemini response structure",
                error=str(exc),
                raw_response=data,
            )
            raise RuntimeError("Unexpected Gemini response structure") from exc

        try:
            parsed = json.loads(text)
        except json.JSONDecodeError as exc:
            self._logger.error(
                "Failed to decode Gemini JSON response",
                error=str(exc),
                raw_text=text,
            )
            raise RuntimeError(
                "Failed to decode Gemini JSON response") from exc

        raw_recs = parsed.get("recommendations", [])
        if not isinstance(raw_recs, list):
            self._logger.error(
                "Invalid recommendations format in Gemini response",
                raw=parsed,
            )
            raise RuntimeError("Invalid recommendations format")

        recs: List[BookRecommendation] = []
        for item in raw_recs:
            if not isinstance(item, dict):
                continue
            try:
                recs.append(BookRecommendation(**item))
            except Exception as exc:  # валидация Pydantic
                self._logger.error(
                    "Failed to parse single recommendation item",
                    error=str(exc),
                    item=item,
                )
                continue

        return RecommendationsResponse(user_id=user_id, recommendations=recs)
