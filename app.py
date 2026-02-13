import streamlit as st
from travel import generate_itinerary, generate_travel_content, generate_packing_checklist, modify_itinerary

# Page configuration for a premium feel
st.set_page_config(
    page_title="TravelGuideAI - Your AI Travel Companion",
    page_icon="✈️",
    layout="wide"
)

# Custom CSS for styling
st.markdown("""
<style>
    .main {
        background-color: #f8f9fa;
    }
    .stButton>button {
        width: 100%;
        border-radius: 20px;
        height: 3em;
        background-color: #ff4b4b;
        color: white;
        font-weight: bold;
    }
    .stTextInput>div>div>input {
        border-radius: 10px;
    }
</style>
""", unsafe_allow_html=True)

st.title("✈️ TravelGuideAI")
st.subheader("Your Ultimate AI-Powered Travel Assistant")

# Create tabs for different functionalities
tab1, tab2, tab3 = st.tabs(["🗺️ Custom Itinerary", "✍️ Blog & Content", "🎒 Packing Assistant"])

with tab1:
    st.header("Plan Your Next Journey")
    col1, col2 = st.columns(2)
    
    with col1:
        destination = st.text_input("Where do you want to go?", placeholder="e.g. Kyoto, Japan", key="itinerary_dest")
        days = st.number_input("Days", min_value=1, value=3, key="itinerary_days")
    
    with col2:
        nights = st.number_input("Nights", min_value=0, value=2, key="itinerary_nights")
        description = st.text_area("Additional preferences", placeholder="e.g. food lover, hiking enthusiast", key="itinerary_prefs")

    if st.button("Generate My Itinerary"):
        if destination.strip():
            with st.spinner("Crafting your perfect journey..."):
                try:
                    itinerary = generate_itinerary(
                        destination=destination, days=days, nights=nights, description=description
                    )
                    st.session_state['current_itinerary'] = itinerary
                    st.success("Here's your custom itinerary!")
                except Exception as e:
                    st.error(f'An error occurred: {e}')
        else:
            st.error("Please enter a destination")

    if 'current_itinerary' in st.session_state:
        st.markdown(st.session_state['current_itinerary'])
        
        st.divider()
        st.header("✨ Modify Your Itinerary")
        mod_request = st.text_area("What would you like to change?", placeholder="e.g. Add more museums on Day 2, or make it more budget-friendly")
        if st.button("Apply Modifications"):
            if mod_request.strip():
                with st.spinner("Updating your journey..."):
                    try:
                        updated = modify_itinerary(st.session_state['current_itinerary'], mod_request)
                        st.session_state['current_itinerary'] = updated
                        st.rerun()
                    except Exception as e:
                        st.error(f"Modification failed: {e}")
            else:
                st.warning("Please enter a modification request.")

with tab2:
    st.header("Engaging Travel Content")
    st.write("Generate well-researched articles, guides, and tips to engage your audience.")
    
    content_type = st.selectbox("What would you like to generate?", ["Article", "Destination Guide", "Travel Tips"])
    blog_destination = st.text_input("Target Destination", placeholder="e.g. Paris, France", key="blog_dest")
    blog_extra = st.text_area("Target Audience / Specific Focus", placeholder="e.g. Eco-conscious travelers, luxury budget", key="blog_extra")

    if st.button("Generate Engaging Content"):
        if blog_destination.strip():
            with st.spinner(f"Writing your {content_type}..."):
                try:
                    content = generate_travel_content(content_type, blog_destination, blog_extra)
                    st.success(f"Generated {content_type}!")
                    st.markdown(content)
                except Exception as e:
                    st.error(f'An error occurred: {e}')
        else:
            st.error("Please enter a destination for the content")

with tab3:
    st.header("🎒 Smart Packing Assistant")
    st.write("Never forget a thing. Get a personalized checklist for your trip.")
    
    col1, col2 = st.columns(2)
    with col1:
        p_destination = st.text_input("Destination", placeholder="e.g. Iceland", key="pack_dest")
        p_month = st.selectbox("Travel Month", ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"], key="pack_month")
    
    with col2:
        p_days = st.number_input("Duration (Days)", min_value=1, value=7, key="pack_days")
        p_activities = st.text_area("Planned Activities", placeholder="e.g. Snorkeling, hiking, fine dining, photography", key="pack_activities")

    if st.button("Generate Packing Checklist"):
        if p_destination.strip():
            with st.spinner("Compiling your checklist..."):
                try:
                    checklist = generate_packing_checklist(p_destination, p_month, p_days, p_activities)
                    st.success(f"Packing checklist for {p_destination} in {p_month}!")
                    st.markdown(checklist)
                except Exception as e:
                    st.error(f'An error occurred: {e}')
        else:
            st.error("Please enter a destination")

