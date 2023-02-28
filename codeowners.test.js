const Codeowners = require('./codeowners.js');
const repos = new Codeowners();

describe('codeowners', () => {
  it('returns owners for file', () => {
    const owner = repos.getOwner(__filename);
    expect(owner).toEqual(['@purefb/fb-test-framework']);
  });

});
