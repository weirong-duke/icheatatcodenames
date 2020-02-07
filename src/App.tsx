import React, {FC, useEffect, useMemo, useState} from 'react';
import 'App.scss';
import Typeahead from './Typeahead';
import {default as data} from 'data/words_and_related_scores.json';

interface relatedWordScoreAndCount {
  [key: string]: [number, number]
}

const App: FC = () => {
  // console.log('data', data)
  const [selectedWords, setSelectedWords] = useState<string[]>([]);
  const [inputText, setInputText] = useState<string>('');

  const relatedWords: relatedWordScoreAndCount = useMemo(() => selectedWords.reduce((final, word) => {
    // @ts-ignore
    const relatedWordScores = data[word];
    if (!relatedWordScores) return final;
    Object.keys(relatedWordScores).forEach((relatedWord) => {
      if (Object.keys(final).includes(relatedWord)) {
        final[relatedWord][0] += relatedWordScores[relatedWord];
        final[relatedWord][1] += 1;
      } else {
        final[relatedWord] = [relatedWordScores[relatedWord], 1];
      }
    });
    return final;
  }, {} as relatedWordScoreAndCount), [selectedWords]);

  const sortedWords = useMemo(() => Object.keys(relatedWords).sort((wordA, wordB) => {
    return relatedWords[wordB][0] - relatedWords[wordA][0];
  }), [selectedWords]);
  console.log('wat', Object.keys(relatedWords).length)
  console.log('relatedWordScores', sortedWords, data['fish'])

  const onSubmit = (e: React.FormEvent) => {
    e?.preventDefault();
    e?.stopPropagation()
    console.log('what the fuck')
    setSelectedWords([...selectedWords, inputText])
    setInputText('')
  };

  const handleSelectTypeahead = (word) => {
    console.log('wat', word)
    setSelectedWords([...selectedWords, word])
  };


  return (
    <div className="App">
      <form className="search"onSubmit={onSubmit}>
        <Typeahead onSelect={handleSelectTypeahead} words={Object.keys(data).filter(word => !selectedWords.includes(word))}/>
        {/*<input onChange={onChange} value={inputText}/>*/}

        <div className="search__contents" >

          {selectedWords.map((word) => {
            return <div className="search__card">
              <span className="outline" />
              <div className="search__text">{word.toUpperCase()}</div>
            </div>
          })}

        </div>
      </form>

      <div className="results">
        {
          sortedWords.slice(0,400).map((word, index) => {
            const [wordScore, relatedCount] = relatedWords[word];
            return <div className="results__word" key={`${word}${index}`} style={{animationDelay: `${12 * index}ms`}}>
              {word}
          </div>})
        }
      </div>
    </div>
  );
};

export default App;
