import React, {FC, useEffect, useState} from 'react';
import {WordScoreType} from 'App'
import 'components/Drawer/Drawer.scss';
import LoadingTitle from "components/LoadingTitle";

interface DrawerProps {
  closeDrawer(e: React.MouseEvent): void;
  color: string;
  relatedInformation: WordScoreType[] | null;
  totalScore: number | null;
  showDrawer: string | false;
}

interface DefinitionDataType {
  data?: DefinitionType,
  error?: string
}

interface DefinitionType {
  adjective?: string;
  adverb?: string;
  noun?: string;
  verb?: string;
}

interface TwinwordResponse {
  meaning?: DefinitionType
  result_code: string;
  result_msg: string;
}

const TYPE_TO_SPLIT = {
  adjective: '(adj)',
  adverb: '(adv)',
  noun: '(nou)',
  verb: '(vrb)'
};

const Drawer: FC<DrawerProps> = ({closeDrawer, color, relatedInformation, showDrawer, totalScore}) => {
  const [definitionData, setDefinitionData] = useState<DefinitionDataType>({} as DefinitionDataType);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchDefinition = async (word: string) => {
      try {
        setLoading(true);
        const response = await fetch(`https://twinword-word-graph-dictionary.p.rapidapi.com/definition/?entry=${word}`, {
          "method": "GET",
          "headers": {
            "x-rapidapi-host": "twinword-word-graph-dictionary.p.rapidapi.com",
            "x-rapidapi-key": "635814f135msh5d0fef504d56895p10d444jsn26edf6b6104f"
          }
        });
        const {meaning, result_code, result_msg}: TwinwordResponse = await response.json();
        if (result_code === "200") {
          setDefinitionData({
            data: meaning,
            error: ''
          });
        } else {
          setDefinitionData({
            data: {},
            error: result_msg
          });
        }
      } catch (e) {
        setDefinitionData({
          error: `There was an issue retrieving the definition.: ${e}`
        });
      } finally {
        setLoading(false);
      }

    };
    if (!showDrawer) {
      setDefinitionData({})
    } else {
      fetchDefinition(showDrawer)
    }
  }, [showDrawer]);

  const renderDefinitionData = () => {
    const {data} = definitionData;
    if (data && Object.keys(data).length) {
      return Object.keys(data).sort().filter((type) => data[type]).map((type, typeIndex) => {
            const definitions = data[type].split(TYPE_TO_SPLIT[type]).filter(definition => definition.trim());
            return <div className="word-class fade-in" key={typeIndex}>
              <div className={"word-class__title"}>{type}.</div>
              {
                definitions.map((definition: string, definitionIndex) => {
                  return <div className="definition" key={definitionIndex}>
                    -{definition}
                  </div>
            })}</div>
          })
    }
    return null;
  };

  const renderScoringBreakdown = () => {
    return <div className="information-drawer__breakdown fade-in">
      <table>
        {
          relatedInformation?.map(({word, score}, informationIndex) => {
            return <tr key={informationIndex}>
              <td>{word.toUpperCase()}</td>
              <td>{score > 0 ? '+' : ''}{(score * 100).toFixed(2)}</td>
            </tr>
          })
        }
      </table>
    </div>
  };

  return <>

    <div className={`information-drawer${showDrawer ? ' visible' : ''}`}>
      <span className="outline" />
      <div className={"information-drawer__content"}>
        {showDrawer && loading ? <LoadingTitle title={showDrawer.toUpperCase()}/> : <div className={"information-drawer__title"}>
          {showDrawer && showDrawer.toUpperCase()}
        </div>}

        {loading ? null : <div className={"information-drawer__score fade-in"}>
          {totalScore && color && <span>Total Score: <span style={{color: `#${color}`}}>{(totalScore * 100).toFixed(2)}</span></span>}
          {renderScoringBreakdown()}
        </div>}

        {renderDefinitionData()}

      </div>

    </div>
    <div className={`information-drawer__overlay${showDrawer ? ' visible' : ''}`} onClick={closeDrawer}/>
  </>
};

export default Drawer;
