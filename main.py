from fastapi import HTTPException
import secrets
from fastapi import FastAPI
from fastapi.responses import RedirectResponse
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import string


application = FastAPI(title="Encurtador de Links")

application.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

urls_armazenadas = {}


class UrlItem(BaseModel):
    url_original: str


def gerar_codigo_curto(tamanho=6):
    caracteres = string.ascii_letters + string.digits
    while True:
        codigo = "".join(secrets.choice(caracteres) for _ in range(tamanho))
        if codigo not in urls_armazenadas:
            return codigo


@application.post("/encurtar")
def endpoint_encurtar(Requisicao: UrlItem):
    codigo_curto = gerar_codigo_curto(tamanho=6)
    urls_armazenadas[codigo_curto] = Requisicao.url_original

    resposta = {"url_encurtada": f"http://localhost:8000/{codigo_curto}"}
    return resposta


@application.get("/{codigo_curto}")
def Redirecionar(codigo_curto: str):
    if codigo_curto not in urls_armazenadas:
        raise HTTPException(status_code=404, detail="Link não encontrado")
    else:
        url_original = urls_armazenadas[codigo_curto]
        return RedirectResponse(url=url_original)
