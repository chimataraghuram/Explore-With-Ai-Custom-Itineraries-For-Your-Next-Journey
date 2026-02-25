
from travel import generate_itinerary
import sys

def test_full_itinerary():
    print("Testing Full Itinerary Generation (including weather)...")
    try:
        # Minimalist call
        result = generate_itinerary(
            destination="London",
            days=2,
            nights=1,
            month="December",
            vibe="Culture",
            budget="Moderate"
        )
        print("\n--- GENERATED ITINERARY ---")
        print(result)
        print("---------------------------")
        
        if "weather" in result.lower():
            print("\n[SUCCESS] Weather information found in itinerary!")
        else:
            print("\n[WARNING] Weather information NOT explicitly found, but check response above.")
            
        return True
    except Exception as e:
        print(f"\n[ERROR] {e}")
        return False

if __name__ == "__main__":
    import io
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')
    test_full_itinerary()
