describe('API: Отримання оголошень', () => {
  it('повертає непорожній масив оголошень', () => {
    cy.request({
      method: 'GET',
      url: 'http://localhost:1488/advertisement/'
      qs: {
        page: 1,
        limit: 10,
        sortDirection: 'DESC',
      }
    }).then((response) => {
      expect(response.status).to.eq(201);
      expect(response.body.success).to.be.true;
      expect(response.body.data).to.be.an('array');
      expect(response.body.data.length).to.be.greaterThan(0);
    });
  });
});
