import { Action } from "/../../pkg/core/src";

const FetchCharacters: Action = {
  effect: async (dispatch) => {
    const response = await fetch(`https://rickandmortyapi.com/api/character`)
    const data = await response.json()
    dispatch({
      test_characters: data.results
    });
  },
}

const app = (
  <main init={FetchCharacters}>
    <h1>Characters</h1>
    <ul>
      {({ test_characters }) => test_characters?.map((character) => (
        <li>
          {character.name} - {character.species} - {character.status}
        </li>
      ))}
    </ul>
    {console.log}
  </main>
)

export default app
