"""
Test script for voting and results API routes
Run the Flask server first, then run this script
"""
import requests
import json

BASE_URL = "http://localhost:5000/api"

def print_response(title, response):
    """Pretty print API response"""
    print(f"\n{'='*60}")
    print(f"📍 {title}")
    print(f"{'='*60}")
    print(f"Status Code: {response.status_code}")
    try:
        print(f"Response: {json.dumps(response.json(), indent=2)}")
    except:
        print(f"Response: {response.text}")

def test_voting_routes():
    """Test all voting endpoints"""
    
    # 1. Test: Get active elections
    print("\n🔵 Testing: GET /elections/active")
    response = requests.get(f"{BASE_URL}/elections/active")
    print_response("Get Active Elections", response)
    
    if response.status_code == 200 and response.json():
        election_id = response.json()[0]['id']
        print(f"\n✅ Found active election: {election_id}")
        
        # 2. Test: Get election ballot
        print("\n🔵 Testing: GET /elections/{election_id}/ballot")
        response = requests.get(f"{BASE_URL}/elections/{election_id}/ballot")
        print_response("Get Election Ballot", response)
        
        ballot_data = response.json()
        
        # 3. Get a real student ID from the database
        # We'll use the first candidate's student info
        if ballot_data['positions'] and ballot_data['positions'][0]['candidates']:
            # Extract student ID by making a request to get student info
            # For now, we'll get it from the init_db seed data
            # The seed creates students, we need to query one
            print("\n🔵 Getting student ID from database...")
            import psycopg
            from dotenv import load_dotenv
            import os
            
            load_dotenv()
            db_url = os.getenv('DATABASE_URL', 'postgresql+psycopg://postgres:1234@localhost:5432/digi-voter')
            # Convert SQLAlchemy URL to psycopg format
            db_url = db_url.replace('postgresql+psycopg://', 'postgresql://')
            
            try:
                conn = psycopg.connect(db_url)
                cur = conn.cursor()
                cur.execute("SELECT id FROM students LIMIT 1")
                result = cur.fetchone()
                test_student_id = str(result[0]) if result else None  # Convert UUID to string
                cur.close()
                conn.close()
                print(f"✅ Found student ID: {test_student_id}")
            except Exception as e:
                print(f"⚠️  Could not get student ID: {e}")
                test_student_id = None
        else:
            test_student_id = None
        
        if not test_student_id:
            print("\n⚠️  No student ID found, skipping vote submission tests")
            return
            
        # 4. Test: Check voted status (should be False initially)
        print("\n🔵 Testing: GET /elections/{election_id}/voted/{student_id}")
        response = requests.get(f"{BASE_URL}/elections/{election_id}/voted/{test_student_id}")
        print_response("Check Voted Status", response)
        
        # 5. Test: Submit vote
        if ballot_data.get('positions') and test_student_id:
            print("\n🔵 Testing: POST /vote")
            
            # Create vote data
            votes = []
            for position in ballot_data['positions']:
                if position['candidates']:
                    votes.append({
                        'position_id': position['id'],
                        'candidate_id': position['candidates'][0]['id']
                    })
            
            vote_data = {
                'election_id': election_id,
                'student_id': test_student_id,
                'votes': votes
            }
            
            response = requests.post(
                f"{BASE_URL}/vote",
                json=vote_data,
                headers={'Content-Type': 'application/json'}
            )
            print_response("Submit Vote", response)
            
            # 6. Test: Check voted status again (should be True now)
            print("\n🔵 Testing: Check voted status after voting")
            response = requests.get(f"{BASE_URL}/elections/{election_id}/voted/{test_student_id}")
            print_response("Check Voted Status (After Voting)", response)
    else:
        print("\n⚠️  No active elections found. Create one first!")

def test_results_routes():
    """Test all results endpoints"""
    
    # 1. Test: Get completed elections
    print("\n🔵 Testing: GET /elections/completed")
    response = requests.get(f"{BASE_URL}/elections/completed")
    print_response("Get Completed Elections", response)
    
    # 2. Test: Get election results (try with active election)
    print("\n🔵 Testing: GET /elections/{election_id}/results")
    response = requests.get(f"{BASE_URL}/elections/active")
    
    if response.status_code == 200 and response.json():
        election_id = response.json()[0]['id']
        
        # Try without admin (should fail for active election)
        print("\n🔵 Testing: Get results without admin access")
        response = requests.get(f"{BASE_URL}/elections/{election_id}/results")
        print_response("Get Election Results (No Admin)", response)
        
        # Try with admin access
        print("\n🔵 Testing: Get results with admin access")
        response = requests.get(f"{BASE_URL}/elections/{election_id}/results?is_admin=true")
        print_response("Get Election Results (Admin)", response)
        
        # 3. Test: Publish results
        print("\n🔵 Testing: POST /elections/{election_id}/publish")
        response = requests.post(f"{BASE_URL}/elections/{election_id}/publish")
        print_response("Publish Election Results", response)

def test_health():
    """Test health endpoint"""
    print("\n🔵 Testing: GET /health")
    response = requests.get(f"{BASE_URL}/health")
    print_response("Health Check", response)

if __name__ == "__main__":
    print("🚀 Starting API Tests...")
    print("Make sure Flask server is running on http://localhost:5000")
    
    try:
        # Health check first
        test_health()
        
        # Test voting routes
        print("\n" + "="*60)
        print("🗳️  TESTING VOTING ROUTES")
        print("="*60)
        test_voting_routes()
        
        # Test results routes
        print("\n" + "="*60)
        print("📊 TESTING RESULTS ROUTES")
        print("="*60)
        test_results_routes()
        
        print("\n" + "="*60)
        print("✅ All tests completed!")
        print("="*60)
        
    except requests.exceptions.ConnectionError:
        print("\n❌ Error: Could not connect to server.")
        print("Make sure Flask is running: python server.py")
    except Exception as e:
        print(f"\n❌ Error: {e}")