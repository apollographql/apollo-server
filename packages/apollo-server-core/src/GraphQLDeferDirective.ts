import { GraphQLDirective } from 'graphql/type/directives';
import { GraphQLBoolean } from 'graphql/type/scalars';
import { DirectiveLocation } from 'graphql/language/directiveLocation';

const GraphQLDeferDirective = new GraphQLDirective({
  name: 'defer',
  description: 'Defers this field if the `if` argument is true',
  locations: [DirectiveLocation.FIELD],
  args: {
    if: {
      type: GraphQLBoolean,
      description: 'Deferred when true.',
    },
  },
});

export default GraphQLDeferDirective;
