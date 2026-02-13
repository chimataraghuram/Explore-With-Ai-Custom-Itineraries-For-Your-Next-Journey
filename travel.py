import google.generativeai as genai
from config import api_key

genai.configure(api_key = api_key)

#function to generate travel itinerary based on user input
def generate_itinerary(destination, days, nights, description):
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

  # Enhanced AI Travel Planner Prompt
  enhanced_prompt = f"""You are TravelGuideAI, an intelligent travel planning assistant.

Generate a personalized travel itinerary for {destination}.

Traveler Input:
- Destination: {destination}
- Trip Duration: {days} days and {nights} nights
- Travel Style/Preferences: {description}

STRICT INSTRUCTIONS:
1. Structure output day-wise (Day 1, Day 2, Day 3...).
2. For each day, include these specific sections: Morning, Afternoon, and Evening.
3. Recommend local food options for each day (breakfast, lunch, or dinner suggestions).
4. Optimize locations geographically to minimize travel time between spots.
5. Adjust activities specifically based on the Travel Style:
   - Adventure → outdoor, hiking, water activities
   - Relax → scenic spots, cafes, sunset views
   - Romantic → intimate dining, peaceful spots
   - Foodie → street food, local restaurants
   - Culture → heritage sites, museums
6. Consider the typical weather in {destination} during the travel month mentioned in preferences.
7. Include an estimated daily budget range (e.g., $100 - $150 per day).
8. Add exactly 2 hidden local gems with a brief description of why they are special.
9. For each landmark or restaurant, include a Google Maps link in this format: [Place Name](https://www.google.com/maps/search/?api=1&query=PLACE_NAME)
10. Keep the output highly structured, professional, and easy to read using Markdown.

COST BREAKDOWN (at the end):
Estimate total trip cost for {destination}:
- Budget hotel per night
- Food per day
- Local transport per day
- Activity tickets & entry fees

Show the estimated total cost for {days} days and provide 3 practical cost-saving tips."""

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
        prompt = f"Write a professional and engaging travel article about {destination}. Include catchy headings and interesting insights. Base it on: {extra_info}"
    elif content_type == "Destination Guide":
        prompt = f"Create a comprehensive destination guide for {destination}. Include best time to visit, top attractions, and hidden gems. Context: {extra_info}"
    elif content_type == "Travel Tips":
        prompt = f"Provide a list of practical and helpful travel tips for visiting {destination}. Focus on culture, safety, and budget. Context: {extra_info}"

    response = model.generate_content(prompt)
    return response.text