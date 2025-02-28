import assert from 'assert';

import getSchema from '../src';
import type { DocumentSchemaType, Schema, SchemaField } from '../src/schema-analyzer';

describe('mixed types nested', function() {
  const docs = [
    {
      _id: 1,
      address: {
        valid: 0
      }
    },
    {
      _id: 2,
      address: {
        valid: false
      }
    },
    {
      _id: 3,
      address: {
        valid: 'None'
      }
    },
    {
      _id: 4,
      address: {}
    },
    {
      _id: 5,
      address: {
        valid: true
      }
    }
  ];

  let schema: Schema;
  let valid: SchemaField | undefined;

  before(async function() {
    schema = await getSchema(docs);
    if (!schema.fields.find(v => v.name === '_id')) {
      throw new Error('Did not pick up `_id` field');
    }

    valid = (schema.fields
      .find(v => v.name === 'address')?.types
      .find(x => x.name === 'Document') as DocumentSchemaType)?.fields
      .find(v => v.name === 'valid');
    if (!valid) {
      throw new Error('Did not pick up `address.valid` field');
    }
    if (!valid.types.find(v => v.name === 'Undefined')) {
      throw new Error('Missing Undefined type on `address.valid`');
    }
  });

  it('should see the `address` field is always present', function() {
    assert.equal(schema.fields.find(v => v.name === 'address')?.probability, 1);
  });
  it('should see the `valid` field in 80% of documents', function() {
    assert.equal(valid?.probability, 0.8);
  });
  it('should see there are 4 possible types for `valid`', function() {
    assert.equal(valid?.types.length, 4);
  });
  it('should see `Number` was used in 20% of documents', function() {
    assert.equal(valid?.types.find(v => v.name === 'Number')?.probability, 0.2);
  });
  it('should see `Boolean` was used in 40% of documents', function() {
    assert.equal(valid?.types.find(v => v.name === 'Boolean')?.probability, 0.4);
  });
  it('should see `Undefined` was used in 20% of documents', function() {
    assert.equal(valid?.types.find(v => v.name === 'Undefined')?.probability, 0.2);
  });
  it('should see `String` was used in 20% of documents', function() {
    assert.equal(valid?.types.find(v => v.name === 'String')?.probability, 0.2);
  });
});
