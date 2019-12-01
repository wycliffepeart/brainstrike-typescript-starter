import { createTestClient } from "apollo-server-testing";
import gql from "graphql-tag";
import { constructTestServer, mockRepos } from "./__utils";
import {
  mockFirstCardResponse,
  mockFirstCardResponseId,
  mockReturnCard,
  mockCardInput
} from "../datasources/__tests__/card";

const GET_CARDS = gql`
  query getCards {
    cards {
      id
      number
      label
      description
    }
  }
`;

const GET_CARD = gql`
  query card($id: ID!) {
    card(id: $id) {
      id
      number
      label
      description
    }
  }
`;

const ADD_CARD = gql`
  mutation addCard($input: CardInput!) {
    addCard(input: $input) {
      success
      message
      card {
        id
        number
        label
        description
      }
    }
  }
`;

const UPDATE_CARD = gql`
  mutation updateCard($id: ID!, $input: CardInput!) {
    updateCard(id: $id, input: $input) {
      success
      message
      card {
        id
        number
        label
        description
      }
    }
  }
`;

const REMOVE_CARD = gql`
  mutation removeCard($id: ID!) {
    removeCard(id: $id) {
      success
      message
    }
  }
`;

describe("Queries", () => {
  it("fetches list of cards", async () => {
    // create an instance of ApolloServer that mocks out context, while reusing
    // existing dataSources, resolvers, and typeDefs.
    const { server } = constructTestServer({
      context: () => ({})
    });

    // mock the datasources' underlying fetch methods, whether that's a REST
    // lookup in the RESTDataSource or the repo query in the TypeORM datasource
    mockRepos.cards.find.mockReturnValueOnce([mockFirstCardResponse]);

    // use our test server as input to the createTestClient fn
    // This will give us an interface, similar to apolloClient.query
    // to run queries against our instance of ApolloServer
    const { query } = createTestClient(server);
    const res = await query({
      query: GET_CARDS
    });
    expect(res).toMatchSnapshot();
  });

  it("fetches single card", async () => {
    const { server } = constructTestServer({
      context: () => ({})
    });
    mockRepos.cards.findOne.mockReturnValueOnce(mockFirstCardResponse);

    const { query } = createTestClient(server);
    const res = await query({
      query: GET_CARD,
      variables: { id: mockFirstCardResponseId }
    });
    expect(res).toMatchSnapshot();
  });
});

describe("Mutations", () => {
  it("create card", async () => {
    const { server } = constructTestServer({
      context: () => ({})
    });

    mockRepos.cards.save.mockReturnValueOnce(mockReturnCard);
    const { mutate } = createTestClient(server);
    const res = await mutate({
      mutation: ADD_CARD,
      variables: { input: mockCardInput }
    });
    expect(res).toMatchSnapshot();
  });

  it("update card", async () => {
    const { server } = constructTestServer({
      context: () => ({})
    });

    mockRepos.cards.findOne.mockReturnValueOnce(mockReturnCard);
    mockRepos.cards.save.mockReturnValueOnce(mockReturnCard);
    const { mutate } = createTestClient(server);
    const res = await mutate({
      mutation: UPDATE_CARD,
      variables: { id: mockFirstCardResponseId, input: mockCardInput }
    });
    expect(res).toMatchSnapshot();
  });

  it("remove card", async () => {
    const { server } = constructTestServer({
      context: () => ({})
    });

    mockRepos.cards.remove.mockReturnValueOnce(mockReturnCard);
    const { mutate } = createTestClient(server);
    const res = await mutate({
      mutation: REMOVE_CARD,
      variables: { id: mockFirstCardResponseId }
    });
    expect(res).toMatchSnapshot();
  });
});
