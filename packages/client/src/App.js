import React from 'react';
import Container from '@material-ui/core/Container';
import Typography from '@material-ui/core/Typography';
import Box from '@material-ui/core/Box';
import Link from '@material-ui/core/Link';
import ProTip from './ProTip';

function Copyright() {
  return (
    <Typography variant="body2" color="textSecondary" align="center">
      {'Copyright © '}
      <Link color="inherit" href="https://material-ui.com/">
        Your Website
      </Link>{' '}
      {new Date().getFullYear()}
      {'.'}
    </Typography>
  );
}

export default function App() {
  return (
    <Container maxWidth="sm">
      <Box my={4}>
        <Typography variant="h4" component="h1" gutterBottom>
          Create React App v4-beta example
        </Typography>
        <ProTip />
        <Copyright />
      </Box>
    </Container>
  );
}

// import React, { Component } from 'react';
// import './App.css';

// import { ApolloProvider } from "react-apollo";

// import { Query } from "react-apollo";
// import gql from "graphql-tag";

// import ApolloClient from "apollo-boost";

// const client = new ApolloClient({
//   uri: "/graphql"
// });

// const Books = () => (
//   <Query
//     query={gql`
//       {
//         books {
//             title
//         }
//       }
//     `}
//   >
//     {({ loading, error, data }) => {
//       if (loading) return <p>Loading...</p>;
//       if (error) return <p>Error :(</p>;

//       return <pre>{data.books[0].title}</pre>;
//     }}
//   </Query>
// );

// class App extends Component {
//   render() {
//     return (
//       <ApolloProvider client={client}>
//         <div className="App">
//           <Books />
//         </div>
//       </ApolloProvider>
//     );
//   }
// }

// export default App;
