const { applicationContext } = require('../test/createTestApplicationContext');
const { AUTO_GENERATED_DEADLINE_DOCUMENT_TYPES } = require('./EntityConstants');
const { DocketEntry } = require('./DocketEntry');

describe('shouldAutoGenerateDeadline', () => {
  AUTO_GENERATED_DEADLINE_DOCUMENT_TYPES.forEach(item => {
    it('should return true when the docket entry is one of AUTO_GENERATED_DEADLINE_DOCUMENT_TYPES', () => {
      const mockDocketEntry = new DocketEntry(
        {
          eventCode: item.eventCode,
        },
        { applicationContext },
      );

      expect(mockDocketEntry.shouldAutoGenerateDeadline()).toBe(true);
    });
  });

  it('should return false when the docket entry is not one of AUTO_GENERATED_DEADLINE_DOCUMENT_TYPES', () => {
    const mockDocketEntry = new DocketEntry(
      {
        eventCode: 'O',
      },
      { applicationContext },
    );

    expect(mockDocketEntry.shouldAutoGenerateDeadline()).toBe(false);
  });
});