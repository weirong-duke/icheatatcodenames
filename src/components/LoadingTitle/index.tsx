import React, {FC} from 'react';
import './LoadingTitle.scss';

interface LoadingTitleProps {
  title: string
};

const LoadingTitle: FC<LoadingTitleProps> = ({title}) => {
  const letters = title.split('');
  return <div className="loading-title">{
    letters.map((letter, letterIndex) => {
      return <span className="loading-title__letter" key={letterIndex} style={{animationDelay: `${48 * (letterIndex)}ms`}}>
        {letter}
      </span>
    })
  }</div>
};

export default LoadingTitle;
