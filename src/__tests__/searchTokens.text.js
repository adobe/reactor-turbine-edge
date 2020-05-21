const searchTokens = require('../searchTokens');

test('search for tokens', () => {
  expect(
    searchTokens({
      a: '%a%',
      b: '%b%bbbb',
      c: 'cccc%c%',
      d: 'dddd%d%dddd',
      e: ['%e1%', '%e2%bbbb', { e11: '%e11%', e12: ['%e13%'] }, ['%e3%']],
      f: '%f1%aaa%f2%'
    })
  ).toEqual(['a', 'b', 'c', 'd', 'e1', 'e2', 'e11', 'e13', 'e3', 'f1', 'f2']);
});
