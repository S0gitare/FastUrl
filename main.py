from fastapi import HTTPException, Request
import secrets
import time
from fastapi import FastAPI
from fastapi.responses import RedirectResponse, FileResponse
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, HttpUrl, field_validator
import string
import re


application = FastAPI(title="Encurtador de Links")

application.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

application.mount("/static", StaticFiles(directory="static"), name="static")

# { "codigo": {"url": str, "expires_at": float | None} }
urls_armazenadas = {}


@application.get("/")
def root():
    return FileResponse("index.html")


@application.get("/robots.txt")
def robots():
    return FileResponse("robots.txt", media_type="text/plain")


@application.get("/sitemap.xml")
def sitemap():
    return FileResponse("sitemap.xml", media_type="application/xml")


class UrlItem(BaseModel):
    url_original: HttpUrl
    slug: str | None = None
    ttl: int | None = None  # segundos; None = nunca expira

    @field_validator('slug')
    @classmethod
    def validar_slug(cls, v):
        if v is None:
            return v
        if not re.match(r'^[a-zA-Z0-9-]{3,20}$', v):
            raise ValueError('Slug deve ter 3-20 caracteres alfanuméricos ou hífens')
        return v


def gerar_codigo_curto(tamanho=6):
    caracteres = string.ascii_letters + string.digits
    while True:
        codigo = "".join(secrets.choice(caracteres) for _ in range(tamanho))
        if codigo not in urls_armazenadas:
            return codigo


@application.post("/encurtar")
def endpoint_encurtar(Requisicao: UrlItem, request: Request):
    slug = Requisicao.slug or gerar_codigo_curto(tamanho=6)

    if slug in urls_armazenadas:
        raise HTTPException(status_code=409, detail="Slug já está em uso")

    expires_at = None
    if Requisicao.ttl is not None:
        expires_at = time.time() + Requisicao.ttl

    urls_armazenadas[slug] = {
        "url": str(Requisicao.url_original),
        "expires_at": expires_at
    }

    base_url = str(request.base_url).rstrip("/")
    return {
        "url_encurtada": f"{base_url}/{slug}",
        "expires_at": expires_at
    }


@application.get("/{codigo_curto}")
def Redirecionar(codigo_curto: str):
    if codigo_curto not in urls_armazenadas:
        raise HTTPException(status_code=404, detail="Link não encontrado")

    entrada = urls_armazenadas[codigo_curto]

    if entrada["expires_at"] is not None and time.time() > entrada["expires_at"]:
        del urls_armazenadas[codigo_curto]
        raise HTTPException(status_code=410, detail="Link expirado")

    return RedirectResponse(url=entrada["url"])
