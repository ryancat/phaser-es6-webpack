import request from 'superagent';

export default {
  getPlayCountStat: () => {
    return request
    .get('/gameLog/playCountStat')
    .set({ 'X-Requested-With': 'XMLHttpRequest' });
  },

  saveGameLog: (gameLog = {}) => {
    return request
    .post('/gameLog/save')
    .set({ 'X-Requested-With': 'XMLHttpRequest' })
    .send(gameLog);
  }
}