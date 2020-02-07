import requests
import json
from scrape_words import scrape_word

def sanitized_score(min, max, score, relative_score):
    range = max - min
    diff = score - min
    if range == 0:
      return 0.2
    return float(diff) / float(range) if relative_score is False else float(score) / float(max)

def validate_response_word(word, input_word):
    return word != ''.join(input_word.split(' ')) and word not in input_word and len(word) > 2

def generate_final_scores(sanitized_scores, finalized_scores):
    for (word, score) in sanitized_scores.items():
       if (not finalized_scores.get(word) and score > 0) or (finalized_scores.get(word) and score > finalized_scores.get(word)):
          finalized_scores[word] = score
    return finalized_scores

def generate_sanitized_score_list(list_of_words, input_word, relative_score=False):
    if len(list_of_words):
        max_score = max([related_word.get('score') for related_word in list_of_words])
        min_score = min([related_word.get('score') for related_word in list_of_words])
        word_scores = {}
        for word_object in list_of_words:
            word = word_object.get('word')
            score = word_object.get('score')
            split_words = word.split(' ')
            for word_instance in split_words:
                if validate_response_word(word_instance, input_word) and not word_scores.get(word_instance):
                    word_scores[word_instance.lower()] = sanitized_score(min_score, max_score, score, relative_score)
        return word_scores
    return {}

def retrieve_datamuse_data(word, query):
    words = requests.get('https://api.datamuse.com/words?{0}={1}'.format(query, word))
    json_words = words.json()
    return generate_sanitized_score_list(json_words, word)

def fetch_related_words(word):
    formatted_word = ''
    formatted_scrape_word = ''
    split_word = word.split(' ')
    if len(split_word) > 1:
        formatted_word = '+'.join(split_word)
        formatted_scrape_word = '_'.join(split_word)
    else:
        formatted_word = word
        formatted_scrape_word = word

    try:
        related_sanitized_scores = retrieve_datamuse_data(formatted_word, 'ml')
        strong_related_sanitized_scores = retrieve_datamuse_data(formatted_word, 'rel_trg')
        adjectives_related_sanitized_scores = retrieve_datamuse_data(formatted_word, 'rel_jjb')
        nouns_related_sanitized_scores = retrieve_datamuse_data(formatted_word, 'rel_jja')
    except Exception as e:
        print('Something broke in Datamuse pull: {0}'.format(e))

    try:
        scrape_related_sanitized_scores = generate_sanitized_score_list(scrape_word(formatted_scrape_word), word, True)
    except Exception as e:
        print('Breaking on word {0}, nouns: {1}'.format(word, e))

    print('scrape related scores', scrape_related_sanitized_scores)

    finalized_scores = {}
    for sanitized_scores in [related_sanitized_scores, strong_related_sanitized_scores, adjectives_related_sanitized_scores, nouns_related_sanitized_scores, scrape_related_sanitized_scores]:
        finalized_scores = generate_final_scores(sanitized_scores, finalized_scores)

    return finalized_scores

fetch_related_words('dinosaur')
