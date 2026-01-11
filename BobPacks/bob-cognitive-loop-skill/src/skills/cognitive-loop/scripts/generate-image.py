#!/usr/bin/env python3
"""
Generate consistent character-based images for Cognitive Loop posts using OpenAI gpt-image-1.

Usage:
    python generate-image.py <markdown_file> [output_image_path]

Example:
    python generate-image.py ~/scratchpad/Cognitive\ Loop/2025-11-03-reintroduction-draft.md
"""

import os
import sys
import re
from pathlib import Path

try:
    from openai import OpenAI
    from dotenv import load_dotenv
except ImportError:
    print("Error: openai or python-dotenv package not installed. Run: pip install openai python-dotenv")
    sys.exit(1)

# Load environment variables from the correct .env file
dotenv_path = Path('/home/walub/projects/Personal_AI_Infrastructure/.env')
if dotenv_path.exists():
    load_dotenv(dotenv_path=dotenv_path)
else:
    print(f"Warning: .env file not found at {dotenv_path}")

# OpenAI API Configuration
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
if not OPENAI_API_KEY:
    print("Error: OPENAI_API_KEY environment variable not set")
    print("Set it with: export OPENAI_API_KEY='your-api-key'")
    sys.exit(1)

# Character Description (embedded from character reference sheet analysis)
# Using best practices for character consistency: specific fixed traits, consistent wording, hierarchical detail structure
CHARACTER_DESCRIPTION = """ILLUSTRATION STYLE (FIXED):
- Hand-drawn cartoon/comic style with warm inviting aesthetic
- Flat colors with bold black outlines
- Friendly approachable art style similar to children's book illustration

PRIMARY CHARACTER IDENTIFIERS (MUST MATCH EXACTLY IN EVERY IMAGE):
- Middle-aged man with long flowing brown hair (shoulder-length, wavy)
- Full bushy salt-and-pepper beard (mixed gray and brown, thick and well-groomed)
- Round friendly face with warm smile
- Warm peachy skin tone (#DCC6BE)

SECONDARY CHARACTER IDENTIFIERS (MUST BE CONSISTENT):
- Two-tone gray plaid housecoat (light gray and dark charcoal gray checkered pattern - MUST BE GRAY, NOT GREEN OR BROWN)
- Matching plaid fabric tie-belt (waistband) around the waist
- Knee-length housecoat with simple collar
- Barefoot with simple brown leather sandals on feet
- Holding a tall wooden walking stick in right hand (light brown/tan wood #BB8867, simple design, reaches to shoulder height)

CHARACTER EXPRESSION (FIXED):
- Friendly, contemplative, peaceful expression
- Gentle eyes
- Slight smile or neutral pleasant expression

REQUIRED BACKGROUND TEMPLATE (MUST INCLUDE IN EVERY IMAGE):
- Happy smiling sun with cartoon face in the sky (bright yellow/orange #FFB347, friendly warm expression, simple round face with eyes and smile)
- Rolling hills landscape in background (golden/tan #D4A574 with patches of green vegetation)
- Teal-to-green gradient sky (#6B9D9E to #8BB28C)
- Natural outdoor setting with warm welcoming atmosphere"""


def extract_image_prompt(markdown_file):
    """Extract image_prompt from post metadata."""
    markdown_path = Path(markdown_file)
    if not markdown_path.exists():
        raise FileNotFoundError(f"Markdown file not found: {markdown_file}")

    with open(markdown_path, 'r', encoding='utf-8') as f:
        content = f.read()

    # Look for image_prompt in metadata section
    match = re.search(r'[-*]\s*image_prompt:\s*(.+?)(?:\n|$)', content, re.MULTILINE)
    if match:
        return match.group(1).strip()

    raise ValueError(f"No image_prompt found in {markdown_file} metadata")


def generate_image(scene_prompt, output_path):
    """Generate image using OpenAI gpt-image-1 API."""
    client = OpenAI(api_key=OPENAI_API_KEY)

    # Combine character description with scene-specific prompt
    full_prompt = f"{CHARACTER_DESCRIPTION}\n\nSCENE: {scene_prompt}"

    print(f"Generating image with gpt-image-1...")
    print(f"Scene: {scene_prompt}")

    try:
        response = client.images.generate(
            model="gpt-image-1",
            prompt=full_prompt,
            size="1536x1024",  # Landscape HD
            quality="high",
            n=1,
        )

        # Debug: print full response
        print(f"API Response: {response}")

        if not response.data or len(response.data) == 0:
            raise ValueError("API returned empty data")

        image_data = response.data[0]

        # gpt-image-1 might return b64_json instead of url
        if hasattr(image_data, 'url') and image_data.url:
            image_url = image_data.url
            print(f"Image URL: {image_url}")
        elif hasattr(image_data, 'b64_json') and image_data.b64_json:
            # Handle base64 response
            import base64
            img_bytes = base64.b64decode(image_data.b64_json)
            output_path = Path(output_path)
            output_path.parent.mkdir(parents=True, exist_ok=True)
            with open(output_path, 'wb') as f:
                f.write(img_bytes)
            print(f"Image saved from base64 to: {output_path}")
            return str(output_path)
        else:
            raise ValueError(f"Unexpected response format: {image_data}")

        # Download and save image
        import requests
        img_data = requests.get(image_url).content

        output_path = Path(output_path)
        output_path.parent.mkdir(parents=True, exist_ok=True)

        with open(output_path, 'wb') as f:
            f.write(img_data)

        print(f"Image saved to: {output_path}")
        return str(output_path)

    except Exception as e:
        print(f"Error generating image: {e}")
        raise


def main():
    if len(sys.argv) < 2:
        print(__doc__)
        sys.exit(1)

    markdown_file = sys.argv[1]

    # Default output path: same directory as markdown, with generated- prefix
    if len(sys.argv) >= 3:
        output_path = sys.argv[2]
    else:
        markdown_path = Path(markdown_file)
        output_filename = f"generated-{markdown_path.stem}.jpg"
        output_path = markdown_path.parent / output_filename

    try:
        # Extract prompt from markdown metadata
        scene_prompt = extract_image_prompt(markdown_file)

        # Generate and save image
        result_path = generate_image(scene_prompt, output_path)
        print(f"\nSuccess! Image ready: {result_path}")

    except Exception as e:
        print(f"Error: {e}", file=sys.stderr)
        sys.exit(1)


if __name__ == "__main__":
    main()
