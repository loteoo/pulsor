import Http from '../../../../pkg/http'

const DoStuffA = () => ({ fooA: 'fooA'})

const DoStuffB = { fooB: 'fooB' }

const InitStuff = [
  { initX: 'fooX'},
  { initY: 'fooY'},
  DoStuffA,
  DoStuffB
]


function FetchCharacters() {
  return Http({
    name: 'characters',
    url: 'https://rickandmortyapi.com/api/character',
  });
}

export default (
  <main init={[InitStuff, FetchCharacters]}>
    <h1>Characters</h1>
    <ul>
      {({ characters }) => characters?.data?.results?.map((character) => (
        <li>
          {character.name} - {character.species} - {character.status}
        </li>
      ))}
    </ul>
  </main>
)
