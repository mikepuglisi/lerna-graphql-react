import React, {forwardRef} from 'react';
import clsx from 'clsx';
import { makeStyles } from '@material-ui/core/styles';
import CssBaseline from '@material-ui/core/CssBaseline';
import Drawer from '@material-ui/core/Drawer';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import List from '@material-ui/core/List';
import Typography from '@material-ui/core/Typography';
import Divider from '@material-ui/core/Divider';
import IconButton from '@material-ui/core/IconButton';
import Badge from '@material-ui/core/Badge';
import Container from '@material-ui/core/Container';
import Grid from '@material-ui/core/Grid';
import Paper from '@material-ui/core/Paper';
// import Link from '@material-ui/core/Link';
import MenuIcon from '@material-ui/icons/Menu';
import ChevronLeftIcon from '@material-ui/icons/ChevronLeft';
import NotificationsIcon from '@material-ui/icons/Notifications';
import { mainListItems, secondaryListItems } from './listItems';
import CheckboxGroup from '../CheckboxGroup/CheckboxGroup';
import Chart from './Chart';
import Deposits from './Deposits';
import Orders from './Orders';
import moment from 'moment';


import MaterialTable from "material-table";

import AddBox from '@material-ui/icons/AddBox';
import ArrowUpward from '@material-ui/icons/ArrowUpward';
import Check from '@material-ui/icons/Check';
import ChevronLeft from '@material-ui/icons/ChevronLeft';
import ChevronRight from '@material-ui/icons/ChevronRight';
import Clear from '@material-ui/icons/Clear';
import DeleteOutline from '@material-ui/icons/DeleteOutline';
import Edit from '@material-ui/icons/Edit';
import FilterList from '@material-ui/icons/FilterList';
import FirstPage from '@material-ui/icons/FirstPage';
import LastPage from '@material-ui/icons/LastPage';
import Remove from '@material-ui/icons/Remove';
import SaveAlt from '@material-ui/icons/SaveAlt';
import Search from '@material-ui/icons/Search';
import ViewColumn from '@material-ui/icons/ViewColumn';

import { Query } from "react-apollo";
import gql from "graphql-tag";


const tableIcons = {
  Add: forwardRef((props, ref) => <AddBox {...props} ref={ref} />),
  Check: forwardRef((props, ref) => <Check {...props} ref={ref} />),
  Clear: forwardRef((props, ref) => <Clear {...props} ref={ref} />),
  Delete: forwardRef((props, ref) => <DeleteOutline {...props} ref={ref} />),
  DetailPanel: forwardRef((props, ref) => <ChevronRight {...props} ref={ref} />),
  Edit: forwardRef((props, ref) => <Edit {...props} ref={ref} />),
  Export: forwardRef((props, ref) => <SaveAlt {...props} ref={ref} />),
  Filter: forwardRef((props, ref) => <FilterList {...props} ref={ref} />),
  FirstPage: forwardRef((props, ref) => <FirstPage {...props} ref={ref} />),
  LastPage: forwardRef((props, ref) => <LastPage {...props} ref={ref} />),
  NextPage: forwardRef((props, ref) => <ChevronRight {...props} ref={ref} />),
  PreviousPage: forwardRef((props, ref) => <ChevronLeft {...props} ref={ref} />),
  ResetSearch: forwardRef((props, ref) => <Clear {...props} ref={ref} />),
  Search: forwardRef((props, ref) => <Search {...props} ref={ref} />),
  SortArrow: forwardRef((props, ref) => <ArrowUpward {...props} ref={ref} />),
  ThirdStateCheck: forwardRef((props, ref) => <Remove {...props} ref={ref} />),
  ViewColumn: forwardRef((props, ref) => <ViewColumn {...props} ref={ref} />)
};


/*
where: {
          landUseCodeDescription: "M-F < 10U",  saleDate_between:["1900-01-01", "2000-01-01"], salePrice_between: [101, 100000]
          }, 
          */

function numberWithCommas(x) {
  return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}
const PropertyTable = () => (
  <Query
    query={gql`
      {
        propertiesConnection (first: 20, skip: 0) {
          pageInfo {
            endCursor
          }
          aggregate {
            count    
          }          
          edges {
            node {
              owner1
              legacyId
              parcelId
              saleDate
              salePrice
              location
              locationCity
              locationZip
              landUseCodeDescription
            }
          }
        }
      }
    `}
  >
    {({ loading, error, data }) => {
      if (loading) return <p>Loading...</p>;
      if (error) return <p>Error :(</p>;

      return <>
              <MaterialTable
              options={{
                pageSize: 20,
                pageSizeOptions: [],
         
              }}
              localization={{
                toolbar: {
                  
                  searchPlaceholder: "Search Address Or Parcel"
                
                }  
              }}
              icons={tableIcons}
          columns={[
            
            { title: "Parcel", field: "parcelId",
            render: rowData => <a href={`https://www.paslc.org/RECard/#/propCard/${rowData.legacyId}`} rel="noopener noreferrer" target="_blank">{rowData.parcelId}</a>
            },
            { title: "Land Use", field: "landUseCodeDescription" },
            { title: "Owner", field: "owner1" },
            { title: "Last Sale", field: "saleDate", render: rowData => moment(rowData.saleDate).format('YYYY-MM-DD') },
            { title: "Last Price", field: "salePrice", type: "numeric" , render: rowData => numberWithCommas(rowData.salePrice)},
            {
              title: "Location",
              field: "location",
              render: rowData => <a href={`https://www.google.com/maps/place/${rowData.location}+${rowData.locationCity}`} target="_blank" rel="noopener noreferrer">{rowData.location}</a>
            },
            {
              title: "City",
              field: "locationCity"
            }
          ]}
          // data={[
          //   { name: "Mehmet", surname: "Baran", birthYear: 1987, birthCity: 63 }
          // ]}

          data={query => {
            console.log("QUERY'", query)
            console.log('data', data)
            return new Promise((resolve, reject) => {
                // prepare your data and then call resolve like this:
                const nodes = data.propertiesConnection.edges.map(edge => edge.node)
                resolve({
                    data: nodes,
                    page: query.page,
                    totalCount: data.propertiesConnection.aggregate.count
                });
            })
          }
          }
          onChangePage={args => {
            console.log("ON CHANGE")
          }}
          title={`${numberWithCommas(data.propertiesConnection.aggregate.count)} Results`}
        />
      </>;
    }}
  </Query>
);

// function Copyright() {
//   return (
//     <Typography variant="body2" color="textSecondary" align="center">
//       {/* {'Copyright © '}
//       <Link color="inherit" href="https://material-ui.com/">
//         Your Website
//       </Link>{' '}
//       {new Date().getFullYear()}
//       {'.'} */}
//     </Typography>
//   );
// }

const drawerWidth = 240;

const useStyles = makeStyles(theme => ({
  root: {
    display: 'flex',
  },
  toolbar: {
    paddingRight: 24, // keep right padding when drawer closed
  },
  toolbarIcon: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-end',
    padding: '0 8px',
    ...theme.mixins.toolbar,
  },
  appBar: {
    zIndex: theme.zIndex.drawer + 1,
    transition: theme.transitions.create(['width', 'margin'], {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.leavingScreen,
    }),
  },
  appBarShift: {
    marginLeft: drawerWidth,
    width: `calc(100% - ${drawerWidth}px)`,
    transition: theme.transitions.create(['width', 'margin'], {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.enteringScreen,
    }),
  },
  menuButton: {
    marginRight: 36,
  },
  menuButtonHidden: {
    display: 'none',
  },
  title: {
    flexGrow: 1,
  },
  drawerPaper: {
    position: 'relative',
    whiteSpace: 'nowrap',
    width: drawerWidth,
    transition: theme.transitions.create('width', {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.enteringScreen,
    }),
  },
  drawerPaperClose: {
    overflowX: 'hidden',
    transition: theme.transitions.create('width', {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.leavingScreen,
    }),
    width: theme.spacing(7),
    [theme.breakpoints.up('sm')]: {
      width: theme.spacing(9),
    },
  },
  appBarSpacer: theme.mixins.toolbar,
  content: {
    flexGrow: 1,
    height: '100vh',
    overflow: 'auto',
  },
  container: {
    paddingTop: theme.spacing(4),
    paddingBottom: theme.spacing(4),
  },
  paper: {
    padding: theme.spacing(2),
    display: 'flex',
    overflow: 'auto',
    flexDirection: 'column',
  },
  fixedHeight: {
    height: 240,
  },
}));

export default function Dashboard() {
  const classes = useStyles();
  const [open, setOpen] = React.useState(false);
  const handleDrawerOpen = () => {
    setOpen(true);
  };
  const handleDrawerClose = () => {
    setOpen(false);
  };
  const fixedHeightPaper = clsx(classes.paper, classes.fixedHeight);

  return (
    <div className={classes.root}>
      <CssBaseline />
      <AppBar position="absolute" className={clsx(classes.appBar, open && classes.appBarShift)}>
        <Toolbar className={classes.toolbar}>
          <IconButton
            edge="start"
            color="inherit"
            aria-label="open drawer"
            onClick={handleDrawerOpen}
            className={clsx(classes.menuButton, open && classes.menuButtonHidden)}
          >
            <MenuIcon />
          </IconButton>
          <Typography component="h1" variant="h6" color="inherit" noWrap className={classes.title}>
            Property Search
          </Typography>
          <IconButton color="inherit">
            <Badge badgeContent={4} color="secondary">
              <NotificationsIcon />
            </Badge>
          </IconButton>
        </Toolbar>
      </AppBar>
      <Drawer
        variant="permanent"
        classes={{
          paper: clsx(classes.drawerPaper, !open && classes.drawerPaperClose),
        }}
        open={open}
      >
        <div className={classes.toolbarIcon}>
          <IconButton onClick={handleDrawerClose}>
            <ChevronLeftIcon />
          </IconButton>
        </div>
        <Divider />
        <List>{mainListItems}</List>
        <Divider />
        <List>{secondaryListItems}</List>
      </Drawer>
      <main className={classes.content}>
        <div className={classes.appBarSpacer} />
        <Container maxWidth="lg" className={classes.container}>
        <CheckboxGroup
          checkboxes={[
        {
          label: 'Shawshank Redemption',
          value: 'shawshankRedemption',
          checked: true,
        },
        {
          label: 'The Godfather',
          value: 'theGodfather',
          checked: true,
        },
        {
          label: 'The Dark Knight',
          value: 'theDarkKnight',
          checked: true,
        },
        {
          label: 'Saving Private Ryan',
          value: 'savingPrivateRyan',
          checked: true,
        },
        {
          label: 'Schindlers List',
          value: 'schindlersList',
          checked: true,
        },
      ]}
          onCheckboxGroupChange={() => {}}
        />          
          <PropertyTable />
        </Container>

        {/* handleCheckboxgroupChange = (updatedUsecaseCBState) => {
          this.setState({
            checkboxes: updatedUsecaseCBState,
          });
        }; */}

      </main>
    </div>
  );
}
