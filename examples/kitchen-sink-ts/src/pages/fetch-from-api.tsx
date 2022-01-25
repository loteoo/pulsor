const FetchCharacters = {
  effect: async (emit) => {
    const response = await fetch(`https://rickandmortyapi.com/api/character`)
    const data = await response.json()
    emit('complete', data.results);
  },
  oncomplete: (_, characters) => ({
    test_characters: characters
  })
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
