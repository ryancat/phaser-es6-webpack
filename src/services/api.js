import request from 'superagent';

export default {
  // Get average time spend and total play count per level
  getPlayStatByLevel: () => {
    return request
    .get('/gameLog/playStatByLevel')
    .set({ 'X-Requested-With': 'XMLHttpRequest' });
  },

  saveGameLog: (gameLog = {}) => {
    return request
    .post('/gameLog/save')
    .set({ 'X-Requested-With': 'XMLHttpRequest' })
    .send(gameLog);
  }

  // updateGameStat: (gameStat = {}) => {
  //   return request
  //   .post('/gameLog/save')
  //   .set({ 'X-Requested-With': 'XMLHttpRequest' })
  //   .send(gameStat);
  // }
}