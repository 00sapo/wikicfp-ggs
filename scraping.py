from urllib.parse import urlparse

import requests
from bs4 import BeautifulSoup

def parse(url):
    predatories_page = requests.get(url)

    domains = []
    soup = BeautifulSoup(predatories_page.content, "html.parser")
    lists = soup.find_all("ul")
    predatory_list = lists[2].find_all("li") + lists[3].find_all("li")
    for predatory in predatory_list:
        link = predatory.find_all("a")
        if len(link) > 0:
            website = link[0]["href"]
        else:
            print("skipping", predatory)
            continue
        domain = urlparse(website).netloc
        domains.append(domain)
    return domains

domains = parse("https://beallslist.net/standalone-journals/")
domains += parse("https://beallslist.net")
domains = set(domains)


with open('src/predatories.txt', 'w') as f:
    f.write("\n".join(domains))
