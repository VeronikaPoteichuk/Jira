import os
import google.generativeai as genai
from llm_interface import LLMInterface
from prompts import GENERAL_PROMPT, ISSUES_PROMPT


class GeminiLLM(LLMInterface):
    def __init__(self, debug: bool = False):
        api_key = os.getenv("GOOGLE_API_KEY")
        if not api_key:
            raise ValueError(
                "GOOGLE_API_KEY environment variable is required for Gemini"
            )
        genai.configure(api_key=api_key)
        self.model = genai.GenerativeModel(
            os.getenv("GEMINI_MODEL", "gemini-1.5-flash")
        )
        self.debug = debug

    def _get_prompt(self, mode: str) -> str:
        if mode == "general":
            return GENERAL_PROMPT
        elif mode in ["issues", "comments"]:
            return ISSUES_PROMPT
        raise ValueError(f"Unknown mode: {mode}")

    def generate_review(self, content: str, mode: str) -> str:
        prompt = self._get_prompt(mode)
        full_input = f"{prompt}\n\n{content}"

        if self.debug:
            print(
                f"Gemini Request:\nModel: {self.model.model_name}\nContent: {full_input[:500]}... (truncated)"
            )

        response = self.model.generate_content(
            full_input,
            generation_config={
                "temperature": 0.0  # Maximum consistency
                # max_output_tokens omitted for unlimited output
            },
        )
        return response.text.strip()
