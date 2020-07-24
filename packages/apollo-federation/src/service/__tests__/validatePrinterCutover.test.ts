import { fixtures } from 'apollo-federation-integration-testsuite';
import { composeAndValidate } from '../../composition';
import { printSchema } from '../printFederatedSchema';
import { printSchema as newPrintSchema } from '../newPrintFederatedSchema';

describe('printFederatedSchema and newPrintFederatedSchema equality', () => {
  const { schema, errors } = composeAndValidate(fixtures);

  it('composes without errors', () => {
    expect(errors).toHaveLength(0);
  });

  it('previous and new printers are identical', () => {
    expect(printSchema(schema)).toEqual(newPrintSchema(schema));
  });
});
