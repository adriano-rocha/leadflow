from playwright.sync_api import sync_playwright

def limpar_texto(texto):
    linhas = texto.split("\n")
    return linhas[-1].strip()

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

        rolar_lista(pagina, limite)

        cards = pagina.locator('div[role="feed"] > div > div[role="article"]')
        total_cards = cards.count()
        quantidade = min(total_cards, limite)
        print(f"Cards disponíveis: {total_cards} | Processando: {quantidade}")

        for i in range(quantidade):
            card = cards.nth(i)
            card.click()
            pagina.wait_for_url("**/maps/place/**", timeout=10000)
            pagina.wait_for_timeout(1500)

            nome = pagina.locator('h1').last.inner_text().strip()

            endereco_el = pagina.locator('button[data-item-id="address"]')
            endereco = limpar_texto(endereco_el.inner_text()) if endereco_el.count() > 0 else "Não informado"

            telefone_el = pagina.locator('button[data-item-id^="phone"]')
            telefone = limpar_texto(telefone_el.inner_text()) if telefone_el.count() > 0 else "Não informado"

            resultados.append({"nome": nome, "endereco": endereco, "telefone": telefone})
            print(f"[{i+1}/{quantidade}] {nome} | {endereco} | {telefone}")

        navegador.close()

    return resultados


if __name__ == "__main__":
    dados = buscar_no_maps("dentista", "Suzano", limite=10)
    print(f"\nTotal extraído: {len(dados)}")