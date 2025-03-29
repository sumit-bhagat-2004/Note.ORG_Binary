import requests
from bs4 import BeautifulSoup
import random
import time

PROXIES = ["http://proxy1.com", "http://proxy2.com"]

def scrape_top_sites(search_query):
    """Scrapes Google search results to find relevant websites"""
    headers = {'User-Agent': 'Mozilla/5.0'}
    proxy = {"http": random.choice(PROXIES)}

    url = f"https://www.google.com/search?q={search_query}"
    response = requests.get(url, headers=headers, proxies=proxy)
    
    soup = BeautifulSoup(response.text, 'html.parser')
    links = [a['href'] for a in soup.find_all('a') if 'url?q=' in a['href']]
    
    time.sleep(random.uniform(2, 5))
    return links[:3]
