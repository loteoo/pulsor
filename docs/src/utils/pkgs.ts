const packagesModules = import.meta.globEager('../../../pkg/*/package.json');
const readmes = import.meta.globEager('../../../pkg/*/README.md');

const allPkgs = Object.values(packagesModules).map(m => m.default);


const pkgs = allPkgs
  .map(pkg => {
    pkg.id = pkg.name.slice(8);
    const readme = readmes[`../../../pkg/${pkg.id}/README.md`];
    if (readme) {
      pkg.readme = readme;
    }
    return pkg
  });

export default pkgs;
