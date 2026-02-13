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
    model_name="gemini-1.5-flash",
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
10. End with:
   - 💰 Estimated Total Trip Cost (with breakdown)
   - 🧳 Smart Packing Suggestions
   - 💡 3 Travel Tips

Formatting Rules:
- Use clear headings
- Use emojis for sections
- Keep sentences short and readable
- Avoid generic AI phrases
- Make it premium but easy to read on dark background

Format the entire response as a professional travel dossier."""

  #start a new chat session with the model
  chat_session = model.start_chat(
  history = [
    {
      "role": "user",
      "parts": [
        enhanced_prompt,
      ],
    },
  ]
  )

  #send the message to the chat and get the response
  response = chat_session.send_message(enhanced_prompt)

  return response.text

# function to generate engaging travel content for Scenario 3
def generate_travel_content(content_type, destination, extra_info):
    generation_config = {
        "temperature": 0.7,
        "top_p": 0.95,
        "top_k": 64,
        "max_output_tokens": 8192,
        "response_mime_type": "text/plain",
    }

    model = genai.GenerativeModel(
        model_name="gemini-1.5-flash",
        generation_config=generation_config
    )

    prompt = ""
    if content_type == "Article":
        prompt = f"Write a professional and engaging travel article about {destination}. Include catchy headings and interesting insights. Base it on: {extra_info}. For each place mentioned, include a Google Maps search link: [Place Name](https://www.google.com/maps/search/?api=1&query=PLACE_NAME)"
    elif content_type == "Destination Guide":
        prompt = f"Create a comprehensive destination guide for {destination}. Include best time to visit, top attractions, and hidden gems. Context: {extra_info}. For each place mentioned, include a Google Maps search link: [Place Name](https://www.google.com/maps/search/?api=1&query=PLACE_NAME)"
    elif content_type == "Travel Tips":
        prompt = f"Provide a list of practical and helpful travel tips for visiting {destination}. Focus on culture, safety, and budget. Context: {extra_info}. For each place mentioned, include a Google Maps search link: [Place Name](https://www.google.com/maps/search/?api=1&query=PLACE_NAME)"

    response = model.generate_content(prompt)
    return response.text

# function to generate a specific packing checklist
def generate_packing_checklist(destination, month, days, activities):
    generation_config = {
        "temperature": 0.5,
        "top_p": 0.95,
        "top_k": 64,
        "max_output_tokens": 4096,
        "response_mime_type": "text/plain",
    }

    model = genai.GenerativeModel(
        model_name="gemini-1.5-flash",
        generation_config=generation_config
    )

    prompt = f"""Create a detailed packing checklist for a trip to {destination} in {month}.
    
Trip Details:
- Duration: {days} days
- Activities: {activities}

Consider:
- Typical weather in {destination} during {month}
- Cultural norms for clothing
- Specific requirements for the mentioned activities

Organize the checklist into these sections:
- 👗 Clothing (Weather-appropriate & respectful)
- 🎒 Essentials (Personal care, safety, comfort)
- 🔌 Gadgets (Tech, power, capture)
- 📄 Documents (Travel essentials)

Keep the formatting clean with Markdown checkboxes [ ]."""

    response = model.generate_content(prompt)
    return response.text

# function to modify an existing itinerary
def modify_itinerary(current_itinerary, user_request):
    generation_config = {
        "temperature": 0.4,
        "top_p": 0.95,
        "top_k": 64,
        "max_output_tokens": 8192,
        "response_mime_type": "text/plain",
    }

    model = genai.GenerativeModel(
        model_name="gemini-1.5-flash",
        generation_config=generation_config
    )

    prompt = f"""Modify the following travel itinerary based on the user's specific request.
    
User Request: "{user_request}"

Original Itinerary:
{current_itinerary}

STRICT INSTRUCTIONS:
1. Start the itinerary with a brief 2-sentence personalization summary explaining why this plan fits the traveler’s selected vibe and preferences.
2. Keep the overall structure (Day-wise, Morning/Afternoon/Evening) identical.
2. Only adjust the specific sections or activities mentioned in the request.
3. Maintain geographical optimization (ensure the plan still makes sense spatially).
4. Keep the same professional tone and formatting (Markdown, links, etc.).
5. If the request is a general preference, apply it across relevant days.
6. For each place mentioned or added, include a Google Maps search link in this format: [Place Name](https://www.google.com/maps/search/?api=1&query=PLACE_NAME)

Format the response as the updated itinerary only."""

    response = model.generate_content(prompt)
    return response.text