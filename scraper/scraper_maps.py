from urllib.parse import quote
from playwright.sync_api import sync_playwright

DOMINIOS_REDE_SOCIAL = [
    "instagram.com",
    "facebook.com",
    "linktr.ee",
    "wa.me",
    "api.whatsapp.com",
    "linkedin.com",
    "tiktok.com",
    "youtube.com",
]

def limpar_texto(texto):
    linhas = texto.split("\n")
    return linhas[-1].strip()

def eh_site_proprio(url):
    if not url:
        return False
    url_lower = url.lower()
    for dominio in DOMINIOS_REDE_SOCIAL:
        if dominio in url_lower:
            return False
    return True

def rolar_lista(pagina, quantidade_desejada, max_tentativas=40):
    feed = pagina.locator('div[role="feed"]')
    tentativas = 0
    while tentativas < max_tentativas:
        cards = pagina.locator('div[role="feed"] > div > div[role="article"]')
        if cards.count() >= quantidade_desejada:
            break
        contagem_antes = cards.count()
        feed.evaluate("(el) => el.scrollBy(0, 800)")
        pagina.wait_for_timeout(1500)
        contagem_depois = pagina.locator('div[role="feed"] > div > div[role="article"]').count()

        # Se não carregou nenhum card novo, provavelmente chegou ao fim da lista
        if contagem_depois == contagem_antes:
            print("Fim da lista de resultados alcançado.")
            break

        tentativas += 1

def buscar_no_maps(segmento, cidade, limite=5):
    query = f"{segmento} em {cidade}"
    resultados = []

    with sync_playwright() as p:
        navegador = p.chromium.launch(headless=True)
        
        # Criação de contexto simulando um navegador real para evitar bloqueios no Render
        contexto = navegador.new_context(
            user_agent="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
            viewport={"width": 1280, "height": 720}
        )
        pagina = contexto.new_page()

        # Correção da URL adicionando a barra após o domínio do Google Maps
        url_busca = f"https://www.google.com/maps/search/{quote(query)}?hl=pt-BR"
        pagina.goto(url_busca)
        pagina.wait_for_selector('div[role="feed"]', timeout=15000)

        # Margem bem maior, já que vamos descartar quem tem site
        margem_estimada = limite * 4
        rolar_lista(pagina, margem_estimada)

        cards = pagina.locator('div[role="feed"] > div > div[role="article"]')
        total_cards = cards.count()
        print(f"Cards disponíveis para análise: {total_cards}")

        for i in range(total_cards):
            if len(resultados) >= limite:
                break

            card = cards.nth(i)
            
            try:
                # Garante que o card está pronto para receber o clique
                card.wait_for(state="visible", timeout=5000)
                card.click()
                
                # ALTERAÇÃO CRUCIAL: Espera o elemento de título principal carregar em vez da URL mutável do Maps
                pagina.wait_for_selector('h1', timeout=15000)
                pagina.wait_for_timeout(2000)

                nome = pagina.locator('h1').last.inner_text().strip()

                if not nome or "Patrocinado" in nome or "Sponsored" in nome:
                    print(f"[{i+1}] Ignorado (anúncio patrocinado ou nome vazio)")
                    continue

                site_el = pagina.locator('a[data-item-id="authority"]')
                url_site = site_el.get_attribute("href") if site_el.count() > 0 else None
                tem_site_proprio = eh_site_proprio(url_site)

                # Filtro principal: se já tem site próprio, descarta e vai pro próximo
                if tem_site_proprio:
                    print(f"[{i+1}] Ignorado ({nome} já possui site próprio)")
                    continue

                endereco_el = pagina.locator('button[data-item-id="address"]')
                endereco = limpar_texto(endereco_el.inner_text()) if endereco_el.count() > 0 else "Não informado"

                telefone_el = pagina.locator('button[data-item-id^="phone"]')
                telefone = limpar_texto(telefone_el.inner_text()) if telefone_el.count() > 0 else "Não informado"

                resultados.append({
                    "nome": nome,
                    "endereco": endereco,
                    "telefone": telefone,
                    "url_site": url_site,
                    "tem_site_proprio": tem_site_proprio,
                })

                print(f"[{len(resultados)}/{limite}] {nome} | SEM site próprio ✅")
                
            except Exception as e:
                print(f"[{i+1}] Erro ao processar card (pode ter pulado devido a lentidão): {str(e)}")
                continue

        navegador.close()

    if len(resultados) < limite:
        print(f"\nAtenção: só foram encontrados {len(resultados)} leads sem site (de {limite} pedidos).")

    return resultados


if __name__ == "__main__":
    dados = buscar_no_maps("advogado", "Suzano", limite=5)
    print(f"\nTotal extraído: {len(dados)}")