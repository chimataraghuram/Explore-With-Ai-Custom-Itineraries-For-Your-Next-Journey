import google.generativeai as genai
from config import api_key

genai.configure(api_key = api_key)

#function to generate travel itinerary based on user input
def generate_itinerary(destination, days, nights, month, vibe, budget):
  generation_config = {
    "temperature": 0.4,
    "top_p": 0.95,
    "top_k": 64,
    "max_output_tokens": 8192,
    "response_mime_type": "text/plain",
  }

  #initialize the generative model
  model = genai.GenerativeModel(
    model_name="gemini-1.5-flash-latest",
    generation_config=generation_config
  )

  # Enhanced AI Travel Planner Prompt - Premium Version
  enhanced_prompt = f"""You are TravelGuideAI, an intelligent and professional AI travel planner.

Create a fully personalized travel itinerary.

Traveler Details:
- Destination: {destination}
- Trip Duration: {days} days and {nights} nights
- Travel Month: {month}
- Travel Style: {vibe}
- Budget Level: {budget}

INSTRUCTIONS:

1. Start with a short 2–3 sentence personalization summary explaining why this plan fits the selected travel style.
2. Structure the itinerary day-wise (Day 1, Day 2, Day 3).
3. Each day must include:
   - 🌅 Morning
   - 🍽 Lunch suggestion
   - 🌇 Afternoon
   - 🌙 Evening
4. Optimize locations geographically (avoid long back-and-forth travel).
5. Adjust activities based on Travel Style:
   - Adventure → trekking, water sports, outdoor activities
   - Relax → scenic views, cafes, sunset points
   - Romantic → intimate dining, peaceful spots
   - Foodie → local markets, signature dishes
   - Culture → monuments, museums, heritage walks
6. Consider weather conditions during Travel Month: {month}
7. Include 2 hidden local gems.
8. Provide estimated daily budget range in INR.
9. For each landmark or restaurant, include a Google Maps link in this format: [Place Name](https://www.google.com/maps/search/?api=1&query=PLACE_NAME)
10. **AI Language Toolkit**: Include a section with 5 essential local phrases in the native language of the destination (with English translation and pronunciation).
11. End with:
   - 💰 Estimated Total Trip Cost (with breakdown)
   - 🧳 Smart Packing Suggestions
   - 💡 3 Travel Tips
   - 🌐 AI Language Toolkit (Essentials for ${destination})

Formatting Rules:
- Use clear headings and plenty of white space.
- Use emojis for sections.
- **Keep sentences extremely short and punchy.**
- **Use bullet points for all lists (activities, tips, packing, etc.).**
- **Avoid long paragraphs.** Each activity should be a single short sentence.
- Make it premium, modern, and ultra-readable on a dark background.

Format the entire response as a clean, minimalist travel dossier. Keep it simple and direct. """

  # Direct generation for faster response
  response = model.generate_content(enhanced_prompt)

  return response.text

# function to generate engaging travel content for Scenario 3
def generate_travel_content(content_type, destination, extra_info):
    generation_config = {
        "temperature": 0.2,
        "top_p": 0.8,
        "top_k": 20,
        "max_output_tokens": 700,
        "response_mime_type": "text/plain",
    }

    model = genai.GenerativeModel(
        model_name="gemini-1.5-flash-latest",
        generation_config=generation_config
    )

    prompt = ""
    if content_type == "Article":
        prompt = f"Write a simple, engaging travel article about {destination}. Use short paragraphs, catchy headings, and bullet points. Base it on: {extra_info}. For each place mentioned, include a Google Maps link: [Place Name](https://www.google.com/maps/search/?api=1&query=PLACE_NAME)"
    elif content_type == "Destination Guide":
        prompt = f"Create a simple, concise destination guide for {destination}. Use bullet points for attractions and tips. Context: {extra_info}. For each place mentioned, include a Google Maps link: [Place Name](https://www.google.com/maps/search/?api=1&query=PLACE_NAME)"
    elif content_type == "Travel Tips":
        prompt = f"Provide a clean, bulleted list of practical travel tips for visiting {destination}. Focus on culture, safety, and budget. Context: {extra_info}. For each place mentioned, include a Google Maps link: [Place Name](https://www.google.com/maps/search/?api=1&query=PLACE_NAME)"

    response = model.generate_content(prompt)
    return response.text

# function to generate a specific packing checklist
def generate_packing_checklist(destination, month, days, activities):
    generation_config = {
        "temperature": 0.1,
        "top_p": 0.8,
        "top_k": 20,
        "max_output_tokens": 500,
        "response_mime_type": "text/plain",
    }

    model = genai.GenerativeModel(
        model_name="gemini-1.5-flash-latest",
        generation_config=generation_config
    )

    prompt = f"""Create a simple and clean packing checklist for a trip to {destination} in {month}.
    
Trip Details:
- Duration: {days} days
- Activities: {activities}

INSTRUCTIONS:
- Keep it ultra-simple and scannable.
- **NO long paragraphs.** Jump straight to the lists.
- Each item should be on a new line with a checkbox [ ].
- Keep item descriptions to 5-10 words maximum.

Organize the checklist into these sections:
- 👗 Clothing
- 🎒 Essentials
- 🔌 Gadgets
- 📄 Documents

Format with Markdown checkboxes [ ]."""

    response = model.generate_content(prompt)
    return response.text

# function to modify an existing itinerary
def modify_itinerary(current_itinerary, user_request):
    generation_config = {
        "temperature": 0.1,
        "top_p": 0.8,
        "top_k": 20,
        "max_output_tokens": 800,
        "response_mime_type": "text/plain",
    }

    model = genai.GenerativeModel(
        model_name="gemini-1.5-flash-latest",
        generation_config=generation_config
    )

    prompt = f"""Modify the following travel itinerary based on the user's specific request.
    
User Request: "{user_request}"

Original Itinerary:
{current_itinerary}

STRICT INSTRUCTIONS:
1. Keep the output extremely simple, concise, and easy to read.
2. Use short, punchy sentences.
3. Use bullet points for all activities.
4. Avoid any long paragraphs or filler text.
5. Only adjust the specific sections or activities mentioned in the request.
6. Maintain the structure (Morning/Afternoon/Evening) but keep it minimalist.
7. For each place mentioned or added, include a Google Maps link: [Place Name](https://www.google.com/maps/search/?api=1&query=PLACE_NAME)

Format the response as the updated minimalist itinerary only."""

    response = model.generate_content(prompt)
    return response.text