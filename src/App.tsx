import React, {FC, useEffect, useMemo, useRef, useState} from 'react';
import Rainbow from 'rainbowvis.js';

import 'App.scss';
import assassin from 'assets/assassin_thumbnail.png';
import civilian from 'assets/civilian.png';
import icon from 'assets/codenamescheatericon.png';
import logo from 'assets/logo.png';
import spyBlue from 'assets/spy_blue_thumbnail.png';
import spyRed from 'assets/spy_red_thumbnail.png';
import Drawer from 'components/Drawer';
import Typeahead from 'components/Typeahead';
import {default as data} from 'data/words_and_related_scores.json';

export type WordScoreType = {
  word: string;
  score: number;
}

interface WordScoreAndCountType {
  [key: string]: [number, WordScoreType[]]
}

const RED_COLOR = '#E2271A';
const BLUE_COLOR = '#66AAC9';
const myRainbow = new Rainbow();

const App: FC = () => {
  const [gradient, setGradient] = useState<any>(myRainbow);
  const [inputText, setInputText] = useState<string>('');
  const [selectedWords, setSelectedWords] = useState<string[]>([]);
  const [showInformationDrawer, setShowInformationDrawer] = useState<string | false>(false);

  const relatedWords: WordScoreAndCountType = useMemo(() => selectedWords.reduce((final, word) => {
    // @ts-ignore
    const relatedWordScores = data[word];
    if (!relatedWordScores) return final;
    Object.keys(relatedWordScores).forEach((relatedWord) => {
      const wordScoreObject: WordScoreType = {
        word: word,
        score: relatedWordScores[relatedWord]
      };
      if (Object.keys(final).includes(relatedWord)) {
        final[relatedWord][0] += relatedWordScores[relatedWord];
        final[relatedWord][1].push(wordScoreObject)
      } else {
        final[relatedWord] = [relatedWordScores[relatedWord], [wordScoreObject]];
      }
    });
    return final;
  }, {} as WordScoreAndCountType), [selectedWords]);

  const sortedWords = useMemo(() => Object.keys(relatedWords).sort((wordA, wordB) => {
    return relatedWords[wordB][0] - relatedWords[wordA][0];
  }), [selectedWords]);

  useEffect(() => {
    if (sortedWords.length) {
      const myRainbow = new Rainbow();
      myRainbow.setSpectrum(BLUE_COLOR, RED_COLOR);
      myRainbow.setNumberRange(relatedWords?.[sortedWords?.[sortedWords.length - 1]][0], relatedWords?.[sortedWords?.[0]][0])
      setGradient(myRainbow);
    }
  }, [sortedWords]);

  const handleExpandTag = (word: string | false) => (e: React.MouseEvent) => {
    setShowInformationDrawer(word)
  };

  const handleSelectTypeahead = (word) => {
    setSelectedWords([...selectedWords, word])
  };

  const onSubmit = (e: React.FormEvent) => {
    e?.preventDefault();
    e?.stopPropagation()
    setSelectedWords([...selectedWords, inputText])
    setInputText('')
  };

  const selectedDrawerWordData = showInformationDrawer ? relatedWords[showInformationDrawer] : null;
  const selectedDrawerWordInformation = selectedDrawerWordData ? selectedDrawerWordData[1] : null;
  const selectedDrawerWordScore = selectedDrawerWordData ? selectedDrawerWordData[0] : null;
  const selectedDrawerWordColor = selectedDrawerWordScore ? gradient.colorAt(selectedDrawerWordScore) : null;


  return (
    <div className="App">
      <div className={"header"} >
        <img alt="Page Icon" className="header__icon" src={icon} />
        <img alt="Page Logo" src={logo} />
      </div>
      <div className="main">
        <form className="search"onSubmit={onSubmit}>
          <Typeahead onSelect={handleSelectTypeahead} words={Object.keys(data).filter(word => !selectedWords.includes(word))}/>

          <div className="search__contents" >

            {selectedWords.map((word) => {
              return <div className="search__card" key={`selected-word-${word}`}>
                <span className="icons">
                      <img alt={`Assign Assassin Button for ${word}`} src={assassin} />
                      <img alt={`Flip Team Button for ${word}`} src={spyBlue} />

                      <img alt={`Remove Card Button for ${word}`}  src={civilian} />
                </span>
                <span className="outline" />
                <div className="search__text">{word.toUpperCase()}</div>
              </div>
            })}

          </div>
        </form>

        <div className="results">
          {
            sortedWords.slice(0,400).map((word, index) => {
              const [wordScore, relatedSelectedWords] = relatedWords[word];
              return <div className="results__tag" key={`${word}${index}`} onClick={handleExpandTag(word)} style={{animationDelay: `${12 * index}ms`, backgroundColor: `#${gradient.colorAt(wordScore)}`}}>
                <div className="results__word">
                  {word}
                </div>
                <div className="results__count">
                  {relatedSelectedWords.length}
                </div>
              </div>})
          }
        </div>
        <Drawer
          closeDrawer={handleExpandTag(false)}
          color={selectedDrawerWordColor}
          relatedInformation={selectedDrawerWordInformation}
          totalScore={selectedDrawerWordScore}
          showDrawer={showInformationDrawer}/>
      </div>

    </div>
  );
};

export default App;
