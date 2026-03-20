from fastapi import FastAPI, APIRouter, HTTPException, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
from passlib.context import CryptContext
from jose import jwt, JWTError
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict
from typing import List, Optional, Dict, Any
import uuid
from datetime import datetime, timezone, timedelta

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Auth configuration
SECRET_KEY = os.environ.get("SECRET_KEY", "reportdesigner-secret-2024-intranet")
ALGORITHM = "HS256"
TOKEN_EXPIRE_HOURS = 48
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
bearer_scheme = HTTPBearer(auto_error=False)

# Create the main app
app = FastAPI()

# Create routers
api_router = APIRouter(prefix="/api")
auth_router = APIRouter(prefix="/auth")

# ============== AUTH MODELS ==============

class UserCreate(BaseModel):
    username: str
    password: str

class UserLogin(BaseModel):
    username: str
    password: str

class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
    username: str

# ============== AUTH HELPERS ==============

def create_access_token(username: str) -> str:
    expire = datetime.utcnow() + timedelta(hours=TOKEN_EXPIRE_HOURS)
    return jwt.encode({"sub": username, "exp": expire}, SECRET_KEY, algorithm=ALGORITHM)

async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(bearer_scheme)) -> str:
    if not credentials:
        raise HTTPException(status_code=401, detail="No autenticado")
    try:
        payload = jwt.decode(credentials.credentials, SECRET_KEY, algorithms=[ALGORITHM])
        username = payload.get("sub")
        if not username:
            raise HTTPException(status_code=401, detail="Token inválido")
        return username
    except JWTError:
        raise HTTPException(status_code=401, detail="Token inválido o expirado")

# ============== AUTH ENDPOINTS ==============

@auth_router.post("/register", response_model=Token)
async def register(input: UserCreate):
    """Create a new user account"""
    existing = await db.users.find_one({"username": input.username}, {"_id": 0})
    if existing:
        raise HTTPException(status_code=400, detail="El usuario ya existe")
    hashed = pwd_context.hash(input.password)
    await db.users.insert_one({
        "username": input.username,
        "hashed_password": hashed,
        "created_at": datetime.now(timezone.utc).isoformat()
    })
    token = create_access_token(input.username)
    return Token(access_token=token, username=input.username)

@auth_router.post("/login", response_model=Token)
async def login(input: UserLogin):
    """Login and receive a JWT token"""
    user = await db.users.find_one({"username": input.username}, {"_id": 0})
    if not user or not pwd_context.verify(input.password, user["hashed_password"]):
        raise HTTPException(status_code=401, detail="Usuario o contraseña incorrectos")
    token = create_access_token(input.username)
    return Token(access_token=token, username=input.username)

@auth_router.get("/me")
async def me(current_user: str = Depends(get_current_user)):
    """Get current logged-in user info"""
    return {"username": current_user}

# ============== MODELS ==============

class ComponentPosition(BaseModel):
    x: float = 0
    y: float = 0
    width: float = 200
    height: float = 150

class ComponentStyle(BaseModel):
    backgroundColor: str = "#FFFFFF"
    borderColor: str = "#E5E7EB"
    borderWidth: int = 1
    borderRadius: int = 4

class ReportComponent(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    type: str  # bar_chart, line_chart, pie_chart, etc.
    label: str
    position: ComponentPosition = Field(default_factory=ComponentPosition)
    style: ComponentStyle = Field(default_factory=ComponentStyle)
    data: Dict[str, Any] = Field(default_factory=dict)

class Annotation(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    text: str
    position: ComponentPosition = Field(default_factory=ComponentPosition)
    color: str = "#F59E0B"

class ReportPage(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str = "Page 1"
    components: List[ReportComponent] = Field(default_factory=list)
    annotations: List[Annotation] = Field(default_factory=list)
    layout: str = "free"  # free, executive, operational, detailed, analytical

class Project(BaseModel):
    model_config = ConfigDict(extra="ignore")
    
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    description: str = ""
    pages: List[ReportPage] = Field(default_factory=list)
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    thumbnail: Optional[str] = None

class ProjectCreate(BaseModel):
    name: str
    description: str = ""

class ProjectUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    pages: Optional[List[ReportPage]] = None
    thumbnail: Optional[str] = None

class PageCreate(BaseModel):
    name: str = "New Page"
    layout: str = "free"

class PageUpdate(BaseModel):
    name: Optional[str] = None
    components: Optional[List[ReportComponent]] = None
    annotations: Optional[List[Annotation]] = None
    layout: Optional[str] = None

# ============== HELPER FUNCTIONS ==============

def serialize_datetime(obj):
    """Convert datetime objects to ISO string for MongoDB storage"""
    if isinstance(obj, datetime):
        return obj.isoformat()
    return obj

def deserialize_project(doc: dict) -> dict:
    """Convert ISO strings back to datetime for response"""
    if 'created_at' in doc and isinstance(doc['created_at'], str):
        doc['created_at'] = datetime.fromisoformat(doc['created_at'])
    if 'updated_at' in doc and isinstance(doc['updated_at'], str):
        doc['updated_at'] = datetime.fromisoformat(doc['updated_at'])
    return doc

# ============== PROJECT ENDPOINTS ==============

@api_router.get("/")
async def root():
    return {"message": "Power BI Mockup Tool API"}

@api_router.get("/projects", response_model=List[Project])
async def get_projects(current_user: str = Depends(get_current_user)):
    """Get all projects"""
    projects = await db.projects.find({}, {"_id": 0}).to_list(1000)
    return [deserialize_project(p) for p in projects]

@api_router.post("/projects", response_model=Project)
async def create_project(input: ProjectCreate, current_user: str = Depends(get_current_user)):
    """Create a new project"""
    project = Project(
        name=input.name,
        description=input.description,
        pages=[ReportPage(name="Page 1", layout="free")]
    )
    doc = project.model_dump()
    doc['created_at'] = doc['created_at'].isoformat()
    doc['updated_at'] = doc['updated_at'].isoformat()
    await db.projects.insert_one(doc)
    return project

@api_router.get("/projects/{project_id}", response_model=Project)
async def get_project(project_id: str, current_user: str = Depends(get_current_user)):
    """Get a specific project"""
    project = await db.projects.find_one({"id": project_id}, {"_id": 0})
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    return deserialize_project(project)

@api_router.put("/projects/{project_id}", response_model=Project)
async def update_project(project_id: str, input: ProjectUpdate, current_user: str = Depends(get_current_user)):
    """Update a project"""
    project = await db.projects.find_one({"id": project_id}, {"_id": 0})
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    
    update_data = input.model_dump(exclude_unset=True)
    update_data['updated_at'] = datetime.now(timezone.utc).isoformat()
    
    await db.projects.update_one(
        {"id": project_id},
        {"$set": update_data}
    )
    
    updated = await db.projects.find_one({"id": project_id}, {"_id": 0})
    return deserialize_project(updated)

@api_router.delete("/projects/{project_id}")
async def delete_project(project_id: str, current_user: str = Depends(get_current_user)):
    """Delete a project"""
    result = await db.projects.delete_one({"id": project_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Project not found")
    return {"message": "Project deleted"}

# ============== PAGE ENDPOINTS ==============

@api_router.post("/projects/{project_id}/pages", response_model=Project)
async def add_page(project_id: str, input: PageCreate):
    """Add a new page to a project"""
    project = await db.projects.find_one({"id": project_id}, {"_id": 0})
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    
    new_page = ReportPage(name=input.name, layout=input.layout)
    
    await db.projects.update_one(
        {"id": project_id},
        {
            "$push": {"pages": new_page.model_dump()},
            "$set": {"updated_at": datetime.now(timezone.utc).isoformat()}
        }
    )
    
    updated = await db.projects.find_one({"id": project_id}, {"_id": 0})
    return deserialize_project(updated)

@api_router.put("/projects/{project_id}/pages/{page_id}", response_model=Project)
async def update_page(project_id: str, page_id: str, input: PageUpdate):
    """Update a specific page"""
    project = await db.projects.find_one({"id": project_id}, {"_id": 0})
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    
    pages = project.get('pages', [])
    page_index = next((i for i, p in enumerate(pages) if p['id'] == page_id), None)
    
    if page_index is None:
        raise HTTPException(status_code=404, detail="Page not found")
    
    update_data = input.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        pages[page_index][key] = value
    
    await db.projects.update_one(
        {"id": project_id},
        {
            "$set": {
                "pages": pages,
                "updated_at": datetime.now(timezone.utc).isoformat()
            }
        }
    )
    
    updated = await db.projects.find_one({"id": project_id}, {"_id": 0})
    return deserialize_project(updated)

@api_router.delete("/projects/{project_id}/pages/{page_id}", response_model=Project)
async def delete_page(project_id: str, page_id: str):
    """Delete a page from a project"""
    project = await db.projects.find_one({"id": project_id}, {"_id": 0})
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    
    pages = project.get('pages', [])
    if len(pages) <= 1:
        raise HTTPException(status_code=400, detail="Cannot delete the last page")
    
    pages = [p for p in pages if p['id'] != page_id]
    
    await db.projects.update_one(
        {"id": project_id},
        {
            "$set": {
                "pages": pages,
                "updated_at": datetime.now(timezone.utc).isoformat()
            }
        }
    )
    
    updated = await db.projects.find_one({"id": project_id}, {"_id": 0})
    return deserialize_project(updated)

# ============== EXPORT ENDPOINT ==============

@api_router.get("/projects/{project_id}/export")
async def export_project(project_id: str):
    """Export project as JSON spec"""
    project = await db.projects.find_one({"id": project_id}, {"_id": 0})
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    
    export_data = {
        "project_name": project['name'],
        "description": project.get('description', ''),
        "exported_at": datetime.now(timezone.utc).isoformat(),
        "pages": []
    }
    
    for page in project.get('pages', []):
        page_export = {
            "page_name": page['name'],
            "layout": page.get('layout', 'free'),
            "components": [],
            "annotations": []
        }
        
        for comp in page.get('components', []):
            page_export['components'].append({
                "type": comp['type'],
                "label": comp['label'],
                "position": comp['position'],
                "style": comp.get('style', {}),
                "data": comp.get('data', {})
            })
        
        for ann in page.get('annotations', []):
            page_export['annotations'].append({
                "text": ann['text'],
                "position": ann['position'],
                "color": ann.get('color', '#F59E0B')
            })
        
        export_data['pages'].append(page_export)
    
    return export_data

# ============== LAYOUT TEMPLATES ==============

@api_router.get("/templates")
async def get_templates():
    """Get predefined layout templates"""
    templates = [
        {
            "id": "executive",
            "name": "Ejecutivo",
            "description": "Dashboard de alto nivel con KPIs principales y gráficos resumidos",
            "thumbnail": "executive",
            "components": [
                {"type": "kpi_card", "label": "KPI 1", "position": {"x": 20, "y": 20, "width": 200, "height": 100}},
                {"type": "kpi_card", "label": "KPI 2", "position": {"x": 240, "y": 20, "width": 200, "height": 100}},
                {"type": "kpi_card", "label": "KPI 3", "position": {"x": 460, "y": 20, "width": 200, "height": 100}},
                {"type": "kpi_card", "label": "KPI 4", "position": {"x": 680, "y": 20, "width": 200, "height": 100}},
                {"type": "bar_chart", "label": "Ventas por Región", "position": {"x": 20, "y": 140, "width": 420, "height": 280}},
                {"type": "line_chart", "label": "Tendencia Mensual", "position": {"x": 460, "y": 140, "width": 420, "height": 280}},
                {"type": "pie_chart", "label": "Distribución", "position": {"x": 20, "y": 440, "width": 280, "height": 220}},
                {"type": "gauge", "label": "Meta Cumplida", "position": {"x": 320, "y": 440, "width": 280, "height": 220}},
            ]
        },
        {
            "id": "operational",
            "name": "Operacional",
            "description": "Vista detallada con tablas y filtros para análisis operativo",
            "thumbnail": "operational",
            "components": [
                {"type": "slicer", "label": "Filtro Fecha", "position": {"x": 20, "y": 20, "width": 180, "height": 60}},
                {"type": "slicer", "label": "Filtro Región", "position": {"x": 220, "y": 20, "width": 180, "height": 60}},
                {"type": "slicer", "label": "Filtro Producto", "position": {"x": 420, "y": 20, "width": 180, "height": 60}},
                {"type": "table", "label": "Detalle de Transacciones", "position": {"x": 20, "y": 100, "width": 580, "height": 300}},
                {"type": "bar_chart", "label": "Top 10 Productos", "position": {"x": 620, "y": 100, "width": 260, "height": 300}},
                {"type": "line_chart", "label": "Evolución Diaria", "position": {"x": 20, "y": 420, "width": 860, "height": 240}},
            ]
        },
        {
            "id": "detailed",
            "name": "Detallado",
            "description": "Análisis profundo con múltiples visualizaciones y matrices",
            "thumbnail": "detailed",
            "components": [
                {"type": "kpi_card", "label": "Total", "position": {"x": 20, "y": 20, "width": 150, "height": 80}},
                {"type": "kpi_card", "label": "Promedio", "position": {"x": 190, "y": 20, "width": 150, "height": 80}},
                {"type": "kpi_card", "label": "Máximo", "position": {"x": 360, "y": 20, "width": 150, "height": 80}},
                {"type": "matrix", "label": "Matriz de Análisis", "position": {"x": 20, "y": 120, "width": 490, "height": 280}},
                {"type": "treemap", "label": "Distribución Jerárquica", "position": {"x": 530, "y": 20, "width": 350, "height": 200}},
                {"type": "scatter", "label": "Correlación", "position": {"x": 530, "y": 240, "width": 350, "height": 160}},
                {"type": "area_chart", "label": "Tendencia Acumulada", "position": {"x": 20, "y": 420, "width": 860, "height": 240}},
            ]
        },
        {
            "id": "analytical",
            "name": "Analítico",
            "description": "Dashboard para científicos de datos con gráficos avanzados",
            "thumbnail": "analytical",
            "components": [
                {"type": "slicer", "label": "Período", "position": {"x": 20, "y": 20, "width": 200, "height": 50}},
                {"type": "slicer", "label": "Segmento", "position": {"x": 240, "y": 20, "width": 200, "height": 50}},
                {"type": "scatter", "label": "Análisis de Dispersión", "position": {"x": 20, "y": 90, "width": 420, "height": 280}},
                {"type": "line_chart", "label": "Series Temporales", "position": {"x": 460, "y": 90, "width": 420, "height": 280}},
                {"type": "bar_chart", "label": "Comparativa", "position": {"x": 20, "y": 390, "width": 280, "height": 270}},
                {"type": "donut_chart", "label": "Composición", "position": {"x": 320, "y": 390, "width": 280, "height": 270}},
                {"type": "gauge", "label": "Índice", "position": {"x": 620, "y": 390, "width": 260, "height": 270}},
            ]
        }
    ]
    return templates

# Include routers
app.include_router(auth_router)
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
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
