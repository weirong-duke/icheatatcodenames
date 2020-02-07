import json
from fetch_related_words import fetch_related_words

with open('codename_words.json') as json_file:
    words = json.load(json_file)
    word_dict = {}
    for word in words:
        try:
            related_word_scores = fetch_related_words(word)
            word_dict[word] = related_word_scores
        except Exception as e:
            print('Broke on {0}: {1}'.format(word, e))

    with open('../src/data/words_and_related_scores.json', 'w') as outfile:
        json.dump(word_dict, outfile)
