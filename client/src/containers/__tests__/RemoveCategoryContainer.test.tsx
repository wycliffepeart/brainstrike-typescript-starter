import React from 'react';
import {
  renderApollo,
  cleanup,
  fireEvent,
  waitForElement,
} from '../../test-utils';

import { mockCache } from '../shared/__mockCache';

// The component AND the query need to be exported
import {
  RemoveCategoryContainer,
  RemoveCategoryDocument,
  GetCategoriesDocument,
} from '../RemoveCategoryContainer';

const mockRemoveId =
  'NjM5NTlhOTktYjU2Mi00OTkxLTkxMTAtY2M3MGQzN2E5YTk2OkNhdGVnb3J5';

const mockCategory = {
  __typename: 'Category',
  id: mockRemoveId,
  name: 'Automotive 1219',
  created: '2020-02-02T10:22:55.849Z',
  updated: '2020-02-02T10:22:55.849Z',
};

// IMPORTANT: make sure your mocks match the query exactly or you'll get empty data in your implementations.
const mocks = [
  {
    request: {
      query: RemoveCategoryDocument,
      variables: { id: mockRemoveId },
    },
    result: {
      data: {
        __typename: 'Mutation',
        removeCategory: {
          __typename: 'CategoryUpdatedResponse',
          success: true,
          message: 'Category Removed',
          category: mockCategory,
        },
      },
    },
  },
];

describe("Remove Category Container", () => {

  afterEach(cleanup);

  it('renders without error', async () => {
    const { getByTestId } = renderApollo(
      <RemoveCategoryContainer
        id={mockRemoveId}
        onSelectCategory={() => {}}
      />,
      { mocks, addTypename: false },
    );
    expect(getByTestId('remove-category-button')).toBeTruthy();
  });

  it('removes category', async () => {

    const { getByTestId } = renderApollo(
      <RemoveCategoryContainer
        id={mockRemoveId}
        onSelectCategory={() => {}}
      />,
      { mocks, addTypename: true, cache: mockCache }, // IMPORTANT addTypename: true is required here or you'll get 'No more mocked queries' error.
    );

    
    fireEvent.click(getByTestId('remove-category-button'));

    // Let's wait until our mocked mutation resolves and
    // the component re-renders.
    // getByTestId throws an error if it cannot find an element with the given ID
    // and waitForElement will wait until the callback doesn't throw an error
    await waitForElement(() => getByTestId('confirm-remove-category-button'));

    fireEvent.click(getByTestId('confirm-remove-category-button'));

    await waitForElement(() => getByTestId('message'));

    // check to make sure the cache's contents have been updated
    const { categories }: any = mockCache.readQuery({
      query: GetCategoriesDocument,
    });

    // check mock category is no longer in mock cache
    expect(categories.filter((category: any) => category.id === mockRemoveId).length).toBe(0);
  });

});
