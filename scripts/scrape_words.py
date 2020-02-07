from selenium import webdriver
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.common.by import By
from selenium.common.exceptions import TimeoutException
from selenium.webdriver.common.keys import Keys
import requests
from bs4 import BeautifulSoup

# CHROME_DRIVER_PATH = 'C:/Users/Weirong/Downloads/chromedriver.exe'
# MIT_URL =
# browser = webdriver.Chrome(executable_path=CHROME_DRIVER_PATH)
def scrape_word(word):
    related_words_and_scores = {}
    request_urls = ['http://conceptnet5.media.mit.edu/c/en/{0}?rel=/r/RelatedTo&limit=100', 'http://conceptnet5.media.mit.edu/c/en/{0}?rel=/r/IsA&limit=100']
    for url in request_urls:
        r = requests.get(url.format(word))
        parsed_body = BeautifulSoup(r.content, 'lxml').body
        for relation in parsed_body.findAll("tr", {"class": "edge-main"}):
            score = float(relation.find('div', {'class': 'weight'}).text.split(':')[1].strip())
            related_word = relation.find('td', {'class': 'edge-start'}).find('a').text.strip()
            relatee_word = relation.find('td', {'class': 'edge-end'}).find('a').text.strip()
            non_input_word = related_word if related_word != word else relatee_word
            try:
                multiple_words = non_input_word.split(' ')
                for each_word in multiple_words:
                    if (word not in each_word) and (each_word not in word):
                        try:
                            each_word.encode('ascii')
                            if each_word != word and (not related_words_and_scores.get(each_word) or related_words_and_scores.get(each_word) < score):
                                related_words_and_scores[each_word] = score
                        except:
                            pass
            except Exception as e:
                print('Broked {0}'.format(e))
    return [{"word": word, "score": score} for (word, score) in related_words_and_scores.items()]
