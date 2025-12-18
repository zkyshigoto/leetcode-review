from openai import AsyncOpenAI
import os

class LLMService:
    def __init__(self, api_key: str, base_url: str = None, model: str = "gpt-4o-mini"):
        self.client = AsyncOpenAI(
            api_key=api_key,
            base_url=base_url if base_url else "https://api.openai.com/v1"
        )
        self.model = model

    async def fetch_problem_description(self, problem_id: str) -> str:
        prompt = f"""
        You are a LeetCode problem database. Return the full problem description for LeetCode problem #{problem_id}.
        Format the response in cleanly formatted Markdown.
        
        IMPORTANT: Use Simplified Chinese (简体中文) for the entire response.
        
        Include:
        1. Title (in Chinese)
        2. Difficulty
        3. Description text (in Chinese)
        4. Example inputs and outputs
        5. Constraints
        
        Do not add any conversational filler. Just the markdown.
        """
        
        response = await self.client.chat.completions.create(
            model=self.model, 
            messages=[{"role": "user", "content": prompt}]
        )
        return response.choices[0].message.content

    async def verify_solution(self, problem_id: str, code: str):
        prompt = f"""
        You are a senior technical interviewer. 
        Problem ID: {problem_id}
        User Code:
        ```python
        {code}
        ```
        
        Task:
        1. Verify if the code correctly solves the problem.
        2. Verify if the time/space complexity is optimal.
        
        Output JSON format only:
        {{
            "correct": true/false,
            "feedback": "Concise feedback in Chinese. Explain why it is wrong or how to improve."
        }}
        """
        
        response = await self.client.chat.completions.create(
            model=self.model, 
            messages=[{"role": "user", "content": prompt}],
            response_format={"type": "json_object"}
        )
        
        import json
        content = json.loads(response.choices[0].message.content)
        return content
