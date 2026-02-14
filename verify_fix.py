
import travel
import sys

def verify_fix():
    print("Verifying fix with 'gemini-flash-latest'...")
    try:
        # Test parameters
        dest = "Paris"
        days = 3
        nights = 2
        month = "September"
        vibe = "Romantic"
        budget = "Luxury"
        
        print(f"Generating itinerary for {dest}...")
        result = travel.generate_itinerary(dest, days, nights, month, vibe, budget)
        
        if result and len(result) > 100:
            print("\n[SUCCESS]: Itinerary generated successfully!")
            print("--- Preview ---")
            print(result[:200] + "...")
            return True
        else:
            print("\n[FAILURE]: Result was empty or too short.")
            return False
            
    except Exception as e:
        print(f"\n[ERROR]: {str(e)}")
        import traceback
        traceback.print_exc()
        return False

if __name__ == "__main__":
    success = verify_fix()
    if success:
        sys.exit(0)
    else:
        sys.exit(1)
