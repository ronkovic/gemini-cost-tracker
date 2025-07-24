// Simple test to verify basic functionality
import { getPriceModel } from '../src/services/calculator/priceTable';

describe('Simple functionality test', () => {
  it('should get price model for gemini-pro', () => {
    const priceModel = getPriceModel('gemini-pro');
    expect(priceModel.model).toBe('gemini-pro');
    expect(priceModel.currency).toBe('USD');
    expect(priceModel.inputTokenPrice).toBe(0.000125);
    expect(priceModel.outputTokenPrice).toBe(0.000375);
  });

  it('should return default pricing for unknown model', () => {
    const priceModel = getPriceModel('unknown-model');
    expect(priceModel.model).toBe('unknown-model');
    expect(priceModel.currency).toBe('USD');
    expect(priceModel.inputTokenPrice).toBe(0.001);
    expect(priceModel.outputTokenPrice).toBe(0.001);
  });
});