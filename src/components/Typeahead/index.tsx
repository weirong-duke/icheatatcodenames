import React, {FC, useMemo, useState} from 'react';
import Fuzzy from 'fuzzyset.js';

import 'components/Typeahead/Typeahead.scss';
interface TypeaheadProps {
  onSelect(word): void;
  words: string[];
}

const TypeAhead: FC<TypeaheadProps> = ({words, onSelect}) => {
  const [inputValue, setInputValue] = useState<string>('');
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [fuzzyScores, setFuzzyScores] = useState<Array<[number, string]>>([]);

  const fuzzySet = useMemo(() => {
    return Fuzzy(words);
  }, [words]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const {value} = e?.target;
    setInputValue(value);
    setFuzzyScores(fuzzySet.get(value) || []);
  } ;

  const handleSelectWord = (word) => () => {
     onSelect(word);
     setInputValue('');
     setFuzzyScores([]);
  };

  const handleToggleOpen = (e: React.FocusEvent) => {
    e?.persist();
    setIsOpen(!isOpen)
  };

  return <div className={`typeahead ${isOpen ? 'open' : ''}`}>
    <input className="typeahead__input" onBlur={handleToggleOpen} onChange={handleInputChange} onFocus={handleToggleOpen} placeholder="Search for Codenames words" value={inputValue.toUpperCase()}/>
    <div className={`typeahead__results ${isOpen ? 'open' : ''}`}>
      {fuzzyScores.sort(([scoreA, _], [scoreB, __]) => {
        return scoreB - scoreA;
      }).slice(0, 9).map(([score, word], index)  => {
        return <div className={`typeahead__result`} onMouseDown={handleSelectWord(word)} key={index}>
          <span className="outline" />
          <div className="search__text">{word.toUpperCase()}</div>
        </div>
      }
      )}
    </div>
  </div>
};

export default TypeAhead;
