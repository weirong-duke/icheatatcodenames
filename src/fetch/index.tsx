export const fetchTwinwordsDefinition = async (word) => {
  const response = await fetch(`https://twinword-word-graph-dictionary.p.rapidapi.com/definition/?entry=${word}`, {
    "method": "GET",
    "headers": {
      "x-rapidapi-host": "twinword-word-graph-dictionary.p.rapidapi.com",
      "x-rapidapi-key": process.env.REACT_APP_RAPID_API_KEY
    }
  });
  return await response.json();
};
