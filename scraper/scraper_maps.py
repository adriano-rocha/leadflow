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

def rolar_lista(pagina, quantidade_desejada):
    feed = pagina.locator('div[role="feed"]')
    tentativas = 0
    while tentativas < 15:
        cards = pagina.locator('div[role="feed"] > div > div[role="article"]')
        if cards.count() >= quantidade_desejada:
            break
        feed.evaluate("(el) => el.scrollBy(0, 800)")
        pagina.wait_for_timeout(1500)
        tentativas += 1

def buscar_no_maps(segmento, cidade, limite=5):
    query = f"{segmento} em {cidade}"
    resultados = []

    with sync_playwright() as p:
        navegador = p.chromium.launch(headless=True)
        pagina = navegador.new_page()

        url_busca = f"https://www.google.com/maps/search/{query}"
        pagina.goto(url_busca)
        pagina.wait_for_selector('div[role="feed"]', timeout=15000)

        rolar_lista(pagina, limite + 5)

        cards = pagina.locator('div[role="feed"] > div > div[role="article"]')
        total_cards = cards.count()
        quantidade_para_tentar = min(total_cards, limite + 5)
        print(f"Cards disponíveis: {total_cards} | Tentando processar: {quantidade_para_tentar}")

        for i in range(quantidade_para_tentar):
            if len(resultados) >= limite:
                break

            card = cards.nth(i)
            card.click()
            pagina.wait_for_url("**/maps/place/**", timeout=10000)
            pagina.wait_for_timeout(2000)

            nome = pagina.locator('h1').last.inner_text().strip()

            if not nome or "Patrocinado" in nome:
                print(f"[{i+1}] Ignorado (anúncio patrocinado ou nome vazio)")
                continue

            endereco_el = pagina.locator('button[data-item-id="address"]')
            endereco = limpar_texto(endereco_el.inner_text()) if endereco_el.count() > 0 else "Não informado"

            telefone_el = pagina.locator('button[data-item-id^="phone"]')
            telefone = limpar_texto(telefone_el.inner_text()) if telefone_el.count() > 0 else "Não informado"

            site_el = pagina.locator('a[data-item-id="authority"]')
            url_site = site_el.get_attribute("href") if site_el.count() > 0 else None
            tem_site_proprio = eh_site_proprio(url_site)

            resultados.append({
                "nome": nome,
                "endereco": endereco,
                "telefone": telefone,
                "url_site": url_site,
                "tem_site_proprio": tem_site_proprio,
            })

            status_site = "COM site próprio" if tem_site_proprio else "SEM site próprio"
            print(f"[{len(resultados)}/{limite}] {nome} | {status_site}")

        navegador.close()

    return resultados


if __name__ == "__main__":
    dados = buscar_no_maps("dentista", "Suzano", limite=10)
    print(f"\nTotal extraído: {len(dados)}")