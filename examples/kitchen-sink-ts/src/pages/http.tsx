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
  <main
    init={FetchCharacters}
    // init={[InitStuff, FetchCharacters]}
  >
    <h1>Characters</h1>
    <ul>
      {({ characters }: any) => characters?.data?.results?.map((character: any) => (
        <li>
          {character.name} - {character.species} - {character.status}
        </li>
      ))}
    </ul>
    <pre>
      <code>
        {s => JSON.stringify(s, null, 2)}
      </code>
    </pre>
  </main>
)
