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
  enhanced_prompt = f"""You are an intelligent AI travel planner.

Generate a detailed itinerary for {destination}.

Travel Duration: {days} days and {nights} nights
Travel Style/Preferences: {description}

FIRST ANALYZE:
- Season in {destination} during the travel month
- Tourist crowd level in the travel month (peak/moderate/low season)
- Logical grouping of locations by area/district

Then use this analysis to generate an optimized itinerary.

STRICT RULES:
- Structure output day-wise
- Optimize locations geographically
- Adjust activities based on Travel Style:
   • Adventure → trekking, water sports, hiking
   • Relax → scenic spots, cafes, sunset points
   • Romantic → private experiences, cozy dining
   • Foodie → local markets, signature dishes
   • History → monuments, museums, heritage walks
- Consider weather in the travel month
- Avoid generic descriptions
- Include hidden local experiences
- Add local transport suggestions
- Add estimated daily cost range
- For each place mentioned, include Google Maps link:
  Format: [Place Name](https://www.google.com/maps/search/?api=1&query=PLACE_NAME)
  Example: [Eiffel Tower](https://www.google.com/maps/search/?api=1&query=Eiffel+Tower+Paris)

COST BREAKDOWN (at the end):
Estimate total trip cost for {destination}:
- Budget hotel per night
- Food per day (breakfast, lunch, dinner)
- Local transport per day
- Activity tickets & entry fees

Provide:
- Estimated per person cost
- Estimated total cost for {days} days
- Cost saving tips (3-5 practical tips)

PACKING CHECKLIST:
Create a packing checklist for {destination} in the travel month.

Consider:
- Weather conditions
- Planned activities
- Trip duration ({days} days)

Organize by:
- Clothing (weather-appropriate)
- Essentials (toiletries, medications, etc.)
- Tech (chargers, adapters, etc.)
- Documents (passport, tickets, insurance, etc.)

Format the output beautifully with proper Markdown formatting."""

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