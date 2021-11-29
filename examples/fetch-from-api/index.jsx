const FetchCharacters = {
  run: async (emit) => {
    const response = await fetch(`https://rickandmortyapi.com/api/character`)
    const data = await response.json()
    emit('complete', data.results);
  },
  oncomplete: (_, characters) => ({
    characters
  })
}

const app = (
  <main init={FetchCharacters}>
    <h1>Characters</h1>
    <ul>
      {({ characters }) => characters?.map((character) => (
        <li>
          {character.name} - {character.species} - {character.status}
        </li>
      ))}
    </ul>
  </main>
)

export default app
