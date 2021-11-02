const fetchData = [
  { characters: [] },
  {
    run: async (emit) => {
      const response = await fetch(`https://rickandmortyapi.com/api/character`)
      const data = await response.json()
      const simplified = data.results.map((character) => ({
        id: character.id,
        name: character.name,
        image: character.image,
        species: character.species,
        status: character.status,
      }))
  
      emit('complete', simplified)
    },
    oncomplete: (state, characters) => ({
      ...state,
      characters
    })
  }
]

const app = (
  <main init={fetchData}>
    <h1>Characters</h1>
    <ul>
      {({ characters }) => characters.map((character) => (
        <li>
          {character.name} - {character.species} - {character.status}
        </li>
      ))}
    </ul>
  </main>
)

export default app