import { h, render, Text, Component, Indent } from 'ink';
import * as Spinner from 'ink-spinner';
import * as Box from 'ink-box';
// import terminal from 'term-size'

import * as Link from 'ink-link';

// const maxCellSize = () => terminal().columns / 4

class DevTools extends Component {
  private props: any;
  private setState: Function;
  state = {
    listening: false,
    url: null,
    port: null,
    operationCount: 0,
    error: null,
    message: null,
  };

  constructor(props) {
    super(props);
    this.props.server.on('start', ({ url, port }) =>
      this.setState({
        listening: true,
        port,
        url,
      })
    );
    this.props.server.on('operation', () => {
      this.setState(({ operationCount }) => ({
        operationCount: operationCount + 1,
      }));
    });
  }

  render(props, state) {
    // if (!state.listening)
    //   return (
    //     <Text>
    //       ApolloServer is ready for listening!<br />
    //       <Spinner green />Waiting on listener
    //     </Text>
    //   );
    return (
      <div>
        <Box
          borderStyle="single"
          borderColor="gray"
          dimBorder
          float="left"
          padding={1}
        >
          <Text>
            ApolloServer is listening on port <Text cyan>{state.port}</Text>
          </Text>
          <br />
          <br />

          <Text>
            Server information:<br />
            <br />
            <Indent size={4}>
              <Link url={`${state.url}/graphql`}>
                <Text magenta>GraphQL Endpoint</Text>
              </Link>
              <br />
              <Link url={`${state.url}/graphiql`}>
                <Text magenta>GraphiQL</Text>
              </Link>
            </Indent>
          </Text>

          <br />
          <br />
          {state.operationCount > 0 && (
            <Text>Operation Count: {state.operationCount}</Text>
          )}
          {state.operationCount === 0 && (
            <Text>
              <Spinner cyan /> Waiting on operations to be sent...
            </Text>
          )}
        </Box>
      </div>
    );
  }
}

export const mount = props => render(<DevTools {...props} />);
