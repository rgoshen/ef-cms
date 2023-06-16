import { clearFormAssigneeIdAction } from './clearFormAssigneeIdAction';
import { runAction } from '@web-client/presenter/test.cerebral';

describe('clearFormAssigneeIdAction', () => {
  it('should set the value of state.<form>.assigneeId to an empty string', async () => {
    const { state } = await runAction(clearFormAssigneeIdAction, {
      props: { form: 'testForm' },
      state: {
        testForm: {
          assigneeId: 'abc-123',
        },
      },
    });

    expect(state.testForm.assigneeId).toBe('');
  });
});
