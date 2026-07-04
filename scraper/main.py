from fastapi import FastAPI
from pydantic import BaseModel
from scraper_maps import buscar_no_maps

app = FastAPI()

# Define o "formato" esperado no corpo da requisição
class BuscaRequest(BaseModel):
    segmento: str
    cidade: str
    limite: int = 10

@app.post("/buscar")
def buscar(request: BuscaRequest):
    resultados = buscar_no_maps(request.segmento, request.cidade, request.limite)
    return {"leads": resultados}