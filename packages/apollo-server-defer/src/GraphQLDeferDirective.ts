import { GraphQLDirective } from 'graphql/type/directives';
import { GraphQLBoolean } from 'graphql/type/scalars';
import { DirectiveLocation } from 'graphql/language/directiveLocation';

const GraphQLDeferDirective = new GraphQLDirective({
  name: 'defer',
  description: 'Defers execution of this field if the `if` argument is true',
  locations: [
    DirectiveLocation.FIELD,
    DirectiveLocation.FRAGMENT_SPREAD,
    DirectiveLocation.INLINE_FRAGMENT,
  ],
  args: {
    if: {
      type: GraphQLBoolean,
      description: 'Deferred when true.',
    },
  },
});

export default GraphQLDeferDirective;
