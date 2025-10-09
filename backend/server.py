from fastapi import FastAPI, APIRouter, HTTPException
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field
from typing import List, Optional
import uuid
from datetime import datetime, timedelta
import json

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Create the main app without a prefix
app = FastAPI(title="EmergiLink API", description="Emergency Support Mobile App API")

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")

# Pydantic Models
class LocationData(BaseModel):
    latitude: float
    longitude: float
    address: str

class EmergencyContact(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    phone: str
    type: str  # 'family', 'friend', 'medical'
    user_id: str

class EmergencyCall(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    emergency_type: str  # 'general', 'medical', 'fire', 'police'
    location: LocationData
    timestamp: datetime = Field(default_factory=datetime.utcnow)
    status: str = Field(default="active")  # 'active', 'resolved', 'cancelled'
    response_time: Optional[str] = None

class EmergencyCallCreate(BaseModel):
    user_id: str
    emergency_type: str
    location: LocationData

class Ambulance(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    type: str  # 'public', 'private'
    location: LocationData
    availability: bool = True
    phone: str
    rating: float = Field(default=4.5)
    estimated_arrival: int  # minutes
    cost: Optional[float] = None

class Hospital(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    address: str
    location: LocationData
    phone: str
    specialties: List[str]
    emergency_services: bool = True
    rating: float = Field(default=4.0)
    distance_km: Optional[float] = None

class DisasterAlert(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    title: str
    description: str
    alert_type: str  # 'flood', 'earthquake', 'cyclone', 'fire', 'other'
    severity: str  # 'low', 'medium', 'high', 'critical'
    location_affected: str
    coordinates: LocationData
    active: bool = True
    issued_at: datetime = Field(default_factory=datetime.utcnow)
    expires_at: datetime
    safety_tips: List[str]

class EmergencyNews(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    title: str
    summary: str
    content: str
    category: str  # 'emergency_response', 'disaster_relief', 'safety_update', 'community_alert'
    location: str
    published_at: datetime = Field(default_factory=datetime.utcnow)
    image_url: Optional[str] = None
    source: str = "EmergiLink News"
    priority: str = "normal"  # 'low', 'normal', 'high', 'urgent'

# Mock Data Generators
def generate_mock_ambulances():
    return [
        Ambulance(
            name="City Emergency Ambulance",
            type="public",
            location=LocationData(latitude=37.7749, longitude=-122.4194, address="San Francisco, CA"),
            phone="+1-555-EMRG",
            estimated_arrival=8,
            rating=4.8
        ),
        Ambulance(
            name="QuickCare Ambulance Service",
            type="private",
            location=LocationData(latitude=37.7849, longitude=-122.4094, address="Downtown SF, CA"),
            phone="+1-555-QUICK",
            estimated_arrival=5,
            rating=4.6,
            cost=150.0
        ),
        Ambulance(
            name="LifeLine Emergency Services",
            type="private",
            location=LocationData(latitude=37.7649, longitude=-122.4294, address="Mission District, SF"),
            phone="+1-555-LIFE",
            estimated_arrival=12,
            rating=4.4,
            cost=120.0
        )
    ]

def generate_mock_hospitals():
    return [
        Hospital(
            name="San Francisco General Hospital",
            address="1001 Potrero Ave, San Francisco, CA 94110",
            location=LocationData(latitude=37.7576, longitude=-122.4086, address="1001 Potrero Ave, SF"),
            phone="+1-415-206-8000",
            specialties=["Emergency Medicine", "Trauma", "Cardiology", "Surgery"],
            rating=4.5,
            distance_km=2.1
        ),
        Hospital(
            name="UCSF Medical Center",
            address="505 Parnassus Ave, San Francisco, CA 94143",
            location=LocationData(latitude=37.7631, longitude=-122.4583, address="505 Parnassus Ave, SF"),
            phone="+1-415-476-1000",
            specialties=["Neurology", "Oncology", "Pediatrics", "Emergency Medicine"],
            rating=4.8,
            distance_km=3.5
        ),
        Hospital(
            name="St. Mary's Medical Center",
            address="450 Stanyan St, San Francisco, CA 94117",
            location=LocationData(latitude=37.7686, longitude=-122.4536, address="450 Stanyan St, SF"),
            phone="+1-415-668-1000",
            specialties=["Emergency Medicine", "Orthopedics", "Cardiology"],
            rating=4.2,
            distance_km=1.8
        )
    ]

def generate_mock_alerts():
    return [
        DisasterAlert(
            title="Flood Warning - Mission District",
            description="Heavy rainfall has caused flooding in low-lying areas of Mission District. Avoid driving through flooded streets.",
            alert_type="flood",
            severity="medium",
            location_affected="Mission District, San Francisco",
            coordinates=LocationData(latitude=37.7599, longitude=-122.4148, address="Mission District, SF"),
            expires_at=datetime.utcnow() + timedelta(hours=6),
            safety_tips=[
                "Avoid driving through flooded roads",
                "Stay on higher ground",
                "Monitor local emergency broadcasts",
                "Keep emergency supplies ready"
            ]
        ),
        DisasterAlert(
            title="High Fire Risk - Bay Area",
            description="Dry conditions and high winds create elevated fire risk. Avoid outdoor burning and report smoke immediately.",
            alert_type="fire",
            severity="high",
            location_affected="San Francisco Bay Area",
            coordinates=LocationData(latitude=37.7749, longitude=-122.4194, address="San Francisco Bay Area"),
            expires_at=datetime.utcnow() + timedelta(hours=24),
            safety_tips=[
                "Avoid outdoor burning",
                "Clear vegetation around homes",
                "Prepare evacuation kit",
                "Monitor emergency alerts"
            ]
        )
    ]

def generate_mock_news():
    return [
        EmergencyNews(
            title="San Francisco Emergency Response Team Saves Lives in Downtown Fire",
            summary="Quick response by SF Fire Department and paramedics resulted in successful evacuation of 50+ people from office building.",
            content="In a remarkable display of coordination, San Francisco's emergency response teams successfully evacuated over 50 people from a downtown office building following an electrical fire on the 12th floor. The incident, which occurred at 2:30 PM yesterday, saw firefighters, paramedics, and police working together to ensure zero casualties. Fire Chief Maria Rodriguez praised the building's emergency systems and the calm response of occupants.",
            category="emergency_response",
            location="Downtown San Francisco",
            published_at=datetime.utcnow() - timedelta(hours=8),
            image_url="https://images.unsplash.com/photo-1554734867-bf3c00a49371",
            priority="high"
        ),
        EmergencyNews(
            title="New Emergency Alert System Reduces Response Times by 40%",
            summary="City-wide implementation of advanced emergency dispatch technology shows significant improvement in response efficiency.",
            content="San Francisco's new AI-powered emergency dispatch system has shown remarkable results in its first quarter of operation. The system, which integrates real-time traffic data, resource availability, and incident severity scoring, has reduced average emergency response times by 40%. Mayor Johnson announced plans to expand the system to neighboring counties.",
            category="safety_update",
            location="San Francisco Bay Area",
            published_at=datetime.utcnow() - timedelta(hours=16),
            image_url="https://images.unsplash.com/photo-1599152097274-5da4c5979b9b",
            priority="normal"
        ),
        EmergencyNews(
            title="Community Emergency Preparedness Workshop This Weekend",
            summary="Free disaster preparedness training available for all Bay Area residents at Civic Center.",
            content="The San Francisco Department of Emergency Management is hosting a comprehensive emergency preparedness workshop this Saturday at the Civic Center. The event will cover earthquake safety, fire evacuation procedures, emergency kit preparation, and family communication plans. Registration is free and includes take-home emergency supplies.",
            category="community_alert",
            location="San Francisco Civic Center",
            published_at=datetime.utcnow() - timedelta(hours=24),
            image_url="https://images.unsplash.com/photo-1619025873875-59dfdd2bbbd6",
            priority="normal"
        ),
        EmergencyNews(
            title="Earthquake Early Warning System Successfully Alerts Residents",
            summary="Recent 4.2 magnitude earthquake triggered automated alerts 15 seconds before shaking began.",
            content="The Bay Area's earthquake early warning system performed flawlessly during yesterday's 4.2 magnitude earthquake near Hayward. Residents received automated alerts on their phones 15 seconds before the shaking began, allowing time to take protective actions. Seismologist Dr. Sarah Chen noted this demonstrates the system's reliability for larger potential earthquakes.",
            category="disaster_relief",
            location="Bay Area",
            published_at=datetime.utcnow() - timedelta(hours=48),
            image_url="https://images.unsplash.com/photo-1554734867-bf3c00a49371",
            priority="high"
        )
    ]

# Emergency Endpoints
@api_router.post("/emergency/sos", response_model=EmergencyCall)
async def trigger_emergency(emergency_data: EmergencyCallCreate):
    """Trigger emergency SOS call"""
    try:
        emergency_call = EmergencyCall(**emergency_data.dict())
        
        # Save to database
        result = await db.emergency_calls.insert_one(emergency_call.dict())
        
        # Mock emergency response processing
        logging.info(f"Emergency call triggered: {emergency_call.id}")
        logging.info(f"Location: {emergency_call.location.address}")
        logging.info(f"User: {emergency_call.user_id}")
        
        return emergency_call
        
    except Exception as e:
        logging.error(f"Emergency call failed: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to process emergency call")

@api_router.get("/emergency/history/{user_id}", response_model=List[EmergencyCall])
async def get_emergency_history(user_id: str):
    """Get emergency call history for a user"""
    try:
        calls = await db.emergency_calls.find({"user_id": user_id}).to_list(100)
        return [EmergencyCall(**call) for call in calls]
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# Ambulance Endpoints
@api_router.get("/ambulances/nearby", response_model=List[Ambulance])
async def get_nearby_ambulances(lat: float = 37.7749, lng: float = -122.4194):
    """Get nearby available ambulances"""
    # Return mock data - in real implementation, this would filter by location
    ambulances = generate_mock_ambulances()
    return [amb for amb in ambulances if amb.availability]

@api_router.post("/ambulances/book")
async def book_ambulance(ambulance_id: str, user_id: str, location: LocationData):
    """Book an ambulance"""
    try:
        booking = {
            "id": str(uuid.uuid4()),
            "ambulance_id": ambulance_id,
            "user_id": user_id,
            "pickup_location": location.dict(),
            "status": "confirmed",
            "booked_at": datetime.utcnow(),
            "estimated_arrival": 10  # minutes
        }
        
        await db.ambulance_bookings.insert_one(booking)
        
        return {
            "message": "Ambulance booked successfully",
            "booking_id": booking["id"],
            "estimated_arrival": "10 minutes",
            "status": "confirmed"
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail="Failed to book ambulance")

# Hospital Endpoints
@api_router.get("/hospitals/nearby", response_model=List[Hospital])
async def get_nearby_hospitals(lat: float = 37.7749, lng: float = -122.4194):
    """Get nearby hospitals"""
    hospitals = generate_mock_hospitals()
    # Sort by distance (mock implementation)
    return sorted(hospitals, key=lambda h: h.distance_km or 0)

@api_router.get("/hospitals/{hospital_id}")
async def get_hospital_details(hospital_id: str):
    """Get detailed hospital information"""
    # Mock hospital details
    return {
        "id": hospital_id,
        "name": "San Francisco General Hospital",
        "emergency_contact": "+1-415-206-8000",
        "departments": ["Emergency", "Trauma", "ICU", "Surgery"],
        "current_wait_time": "15-30 minutes",
        "bed_availability": "Available",
        "accepts_insurance": True
    }

# Disaster Alert Endpoints
@api_router.get("/alerts/active", response_model=List[DisasterAlert])
async def get_active_alerts(lat: float = None, lng: float = None):
    """Get active disaster alerts"""
    alerts = generate_mock_alerts()
    return [alert for alert in alerts if alert.active]

@api_router.get("/alerts/{alert_id}", response_model=DisasterAlert)
async def get_alert_details(alert_id: str):
    """Get specific alert details"""
    alerts = generate_mock_alerts()
    for alert in alerts:
        if alert.id == alert_id:
            return alert
    raise HTTPException(status_code=404, detail="Alert not found")

# User Management Endpoints
@api_router.post("/users/{user_id}/emergency-contacts", response_model=EmergencyContact)
async def add_emergency_contact(user_id: str, contact: dict):
    """Add emergency contact for user"""
    try:
        emergency_contact = EmergencyContact(
            name=contact["name"],
            phone=contact["phone"],
            type=contact["type"],
            user_id=user_id
        )
        
        await db.emergency_contacts.insert_one(emergency_contact.dict())
        return emergency_contact
        
    except Exception as e:
        raise HTTPException(status_code=500, detail="Failed to add emergency contact")

@api_router.get("/users/{user_id}/emergency-contacts", response_model=List[EmergencyContact])
async def get_emergency_contacts(user_id: str):
    """Get emergency contacts for user"""
    try:
        contacts = await db.emergency_contacts.find({"user_id": user_id}).to_list(100)
        return [EmergencyContact(**contact) for contact in contacts]
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# Safety and Navigation Endpoints
@api_router.get("/navigation/safe-route")
async def get_safe_route(
    start_lat: float, start_lng: float,
    end_lat: float, end_lng: float
):
    """Get safe route avoiding danger zones"""
    # Mock safe route response
    return {
        "route": {
            "distance": "5.2 km",
            "duration": "12 minutes",
            "safety_score": 9.2,
            "warnings": [],
            "waypoints": [
                {"lat": start_lat, "lng": start_lng, "instruction": "Start point"},
                {"lat": (start_lat + end_lat) / 2, "lng": (start_lng + end_lng) / 2, "instruction": "Continue on Main St"},
                {"lat": end_lat, "lng": end_lng, "instruction": "Destination"}
            ]
        },
        "alternative_routes": 2,
        "danger_zones_avoided": ["Construction zone on 5th Street", "Reported flooding on Mission St"]
    }

# Emergency News Endpoints
@api_router.get("/news", response_model=List[EmergencyNews])
async def get_emergency_news(category: str = None, priority: str = None, limit: int = 20):
    """Get emergency news and updates"""
    news = generate_mock_news()
    
    # Filter by category if provided
    if category:
        news = [n for n in news if n.category == category]
    
    # Filter by priority if provided
    if priority:
        news = [n for n in news if n.priority == priority]
    
    # Sort by priority (urgent > high > normal > low) then by published_at
    priority_order = {'urgent': 0, 'high': 1, 'normal': 2, 'low': 3}
    news.sort(key=lambda x: (priority_order.get(x.priority, 3), -x.published_at.timestamp()))
    
    return news[:limit]

@api_router.get("/news/{news_id}", response_model=EmergencyNews)
async def get_news_details(news_id: str):
    """Get detailed news article"""
    news = generate_mock_news()
    for article in news:
        if article.id == news_id:
            return article
    raise HTTPException(status_code=404, detail="News article not found")

@api_router.get("/news/categories")
async def get_news_categories():
    """Get available news categories"""
    return {
        "categories": [
            {"id": "emergency_response", "name": "Emergency Response", "icon": "medical"},
            {"id": "disaster_relief", "name": "Disaster Relief", "icon": "warning"},
            {"id": "safety_update", "name": "Safety Updates", "icon": "shield-checkmark"},
            {"id": "community_alert", "name": "Community Alerts", "icon": "people"}
        ]
    }

# Health check endpoint
@api_router.get("/health")
async def health_check():
    return {"status": "healthy", "service": "EmergiLink API", "timestamp": datetime.utcnow()}

# Include the router in the main app
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8001)