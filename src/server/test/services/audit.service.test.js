const fetch = require('node-fetch');

jest.mock('node-fetch', () => jest.fn());
const mockResponse = '1234';
const mockFetchResponse = {
  ok: true,
  json: () => Promise.resolve(mockResponse),
};
fetch.mockResolvedValueOnce(mockFetchResponse);

const { createAudit } = require('../../src/services/audit.service');
const { coreServicesEndpoints } = require('../../src/config/constants');

describe('audit service', () => {
  it('should call audit microservice correctly', async () => {
    const mockReq = { mock: 'test' };
    const res = await createAudit(mockReq);
    expect(res).toEqual(mockResponse);
    const expectedUrl = `${process.env.CORE_SERVICES_API_BASE_URL}${coreServicesEndpoints.createAudit}`;
    expect(fetch.mock.calls[0][0]).toBe(expectedUrl);
    expect(fetch.mock.calls[0][1].body).toBe(JSON.stringify(mockReq));
    expect(fetch.mock.calls[0][1].method).toBe('POST');
  });
});
