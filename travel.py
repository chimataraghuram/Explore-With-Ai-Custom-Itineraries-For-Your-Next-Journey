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

  #start a new chat session with the model
  chat_session = model.start_chat(
  history = [
    {
      "role": "user",
      "parts": [
        f"""write me a travel itinerary to {destination} for {days} days
        and {nights} nights including day-wise activities, accommodation, 
        local food, transport, tips, and tailored to {description}""",
      ],
    },
  ]
  )

  #send the message to the chat and get the response
  response = chat_session.send_message(
  f"""Create a detailed travel itinerart for {days} days 
  and {nights} nights in {destination} tailored to {description}"""
  )

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