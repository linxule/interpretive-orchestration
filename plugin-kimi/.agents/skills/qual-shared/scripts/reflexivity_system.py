#!/usr/bin/env python3
"""
Reflexivity System: Context-aware prompts for researcher reflection.

Implements 18 curated prompts across 3 categories:
- Epistemic: "How do I know?"
- Methodological: "Why this approach?"
- Personal: "Where am I in this?"
"""

import random
from typing import Dict, List, Optional
from enum import Enum


class ReflexivityCategory(Enum):
    EPISTEMIC = "epistemic"           # "How do I know?"
    METHODOLOGICAL = "methodological"  # "Why this approach?"
    PERSONAL = "personal"             # "Where am I in this?"


class ReflexivitySystem:
    """
    Manages reflexivity prompts for qualitative research.
    
    Philosophy: Reflection should be prompted at key moments,
    not constantly. Quality over quantity.
    """
    
    # 18 Curated prompts organized by category and context
    PROMPTS = {
        ReflexivityCategory.EPISTEMIC: {
            "open_coding": [
                "What assumptions about this phenomenon are you bringing to this code?",
                "How might your background be shaping what you're seeing?",
                "What would a different theoretical lens see here?"
            ],
            "axial_coding": [
                "If a colleague disagreed with this interpretation, what would their argument be?",
                "What evidence would change your coding decision?",
                "How certain are you of this interpretation? What creates that certainty?"
            ],
            "selective_coding": [
                "How does this core category serve the theoretical story you're telling?",
                "What alternative core categories did you consider and reject?",
                "What would falsify your emerging theory?"
            ],
            "memo_writing": [
                "What surprised you in this analysis, and what does that surprise reveal?",
                "How has your understanding evolved from your initial reading?"
            ]
        },
        
        ReflexivityCategory.METHODOLOGICAL: {
            "open_coding": [
                "Why did you choose this code over alternatives you considered?",
                "How does this code relate to your existing framework?",
                "What are you NOT coding, and why?"
            ],
            "axial_coding": [
                "Why did you connect these particular categories?",
                "How might a different methodological tradition code this differently?",
                "What warrants your claim that these phenomena are related?"
            ],
            "selective_coding": [
                "How does your theoretical sampling support this core category?",
                "Have you adequately considered negative cases?",
                "Does your evidence match the level of your claims?"
            ],
            "memo_writing": [
                "What methodological decision are you making here, and why?",
                "How does this memo advance your theoretical development?"
            ]
        },
        
        ReflexivityCategory.PERSONAL: {
            "open_coding": [
                "What in your experience resonates with or resists this participant's account?",
                "When did you feel most engaged or distant during this coding?",
                "What emotions came up as you read this segment?"
            ],
            "axial_coding": [
                "How is your positionality shaping the connections you're making?",
                "Whose perspective might be missing from your interpretation?",
                "What power dynamics are at play in this analysis?"
            ],
            "selective_coding": [
                "Where are you in this theoretical story?",
                "How might your social location limit what you can see?",
                "What are you choosing to emphasize, and what gets backgrounded?"
            ],
            "memo_writing": [
                "Where are you in this interpretation?",
                "What does your reaction to this data reveal about you as researcher?",
                "How has this research changed you?"
            ]
        }
    }
    
    def __init__(self):
        self._recent_prompts: List[str] = []  # Avoid repetition
        self._max_recent = 5
    
    def get_prompt(
        self,
        category: Optional[ReflexivityCategory] = None,
        context: str = "open_coding",
        avoid_repetition: bool = True
    ) -> str:
        """
        Get a reflexivity prompt.
        
        Args:
            category: EPISTEMIC, METHODOLOGICAL, or PERSONAL (auto if None)
            context: open_coding, axial_coding, selective_coding, memo_writing
            avoid_repetition: Don't repeat recent prompts
        
        Returns:
            Selected prompt string
        """
        # Auto-select category if not specified
        if category is None:
            category = random.choice(list(ReflexivityCategory))
        
        # Get prompts for category and context
        category_prompts = self.PROMPTS.get(category, {})
        context_prompts = category_prompts.get(context, [])
        
        if not context_prompts:
            # Fallback to open_coding if context not found
            context_prompts = category_prompts.get("open_coding", ["What are you noticing?"])
        
        # Filter out recent prompts
        if avoid_repetition:
            available = [p for p in context_prompts if p not in self._recent_prompts]
            if not available:
                available = context_prompts  # Reset if all filtered
        else:
            available = context_prompts
        
        # Select and track
        prompt = random.choice(available)
        self._track_prompt(prompt)
        
        return prompt
    
    def _track_prompt(self, prompt: str):
        """Track recent prompts to avoid repetition."""
        self._recent_prompts.append(prompt)
        if len(self._recent_prompts) > self._max_recent:
            self._recent_prompts.pop(0)
    
    def get_prompts_for_session(
        self,
        num_prompts: int = 3,
        context: str = "open_coding"
    ) -> List[Dict[str, str]]:
        """
        Get a set of prompts for a session.
        
        Returns one from each category, or distributed if more requested.
        """
        prompts = []
        categories = list(ReflexivityCategory)
        
        for i in range(num_prompts):
            category = categories[i % len(categories)]
            prompt = self.get_prompt(category, context)
            prompts.append({
                "category": category.value,
                "prompt": prompt
            })
        
        return prompts
    
    def format_prompt_for_display(self, prompt: str, category: ReflexivityCategory) -> str:
        """Format prompt with category indicator."""
        icons = {
            ReflexivityCategory.EPISTEMIC: "🧠",
            ReflexivityCategory.METHODOLOGICAL: "📐",
            ReflexivityCategory.PERSONAL: "👤"
        }
        
        icon = icons.get(category, "💭")
        return f"{icon} {prompt}"


# Session-level reflexivity prompts

SESSION_START_PROMPTS = [
    "What preconceptions are you bringing to today's session?",
    "What would you like to focus on today?",
    "What questions are you holding about your data?"
]

SESSION_END_PROMPTS = [
    "What interpretive decision are you least certain about?",
    "What would change your mind about your emerging interpretation?",
    "What surprised you today, and what does that reveal?",
    "How has your thinking shifted during this session?",
    "What do you need to revisit tomorrow?"
]


def get_session_start_prompt() -> str:
    """Get prompt for session start."""
    return random.choice(SESSION_START_PROMPTS)


def get_session_end_prompt() -> str:
    """Get prompt for session end."""
    return random.choice(SESSION_END_PROMPTS)


if __name__ == "__main__":
    # Demo
    reflexivity = ReflexivitySystem()
    
    print("=" * 60)
    print("REFLEXIVITY SYSTEM DEMO")
    print("=" * 60)
    
    print("\n1. Epistemic prompts (open coding):")
    for _ in range(3):
        prompt = reflexivity.get_prompt(
            ReflexivityCategory.EPISTEMIC, 
            "open_coding"
        )
        print(f"  • {prompt}")
    
    print("\n2. Methodological prompts (axial coding):")
    for _ in range(3):
        prompt = reflexivity.get_prompt(
            ReflexivityCategory.METHODOLOGICAL, 
            "axial_coding"
        )
        print(f"  • {prompt}")
    
    print("\n3. Personal prompts (selective coding):")
    for _ in range(3):
        prompt = reflexivity.get_prompt(
            ReflexivityCategory.PERSONAL, 
            "selective_coding"
        )
        print(f"  • {prompt}")
    
    print("\n4. Session prompts:")
    print(f"  Start: {get_session_start_prompt()}")
    print(f"  End: {get_session_end_prompt()}")
    
    print("\n5. Full session set (3 prompts):")
    session_prompts = reflexivity.get_prompts_for_session(3, "axial_coding")
    for p in session_prompts:
        formatted = reflexivity.format_prompt_for_display(
            p["prompt"], 
            ReflexivityCategory(p["category"])
        )
        print(f"  {formatted}")
