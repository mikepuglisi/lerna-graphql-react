import React from 'react';
import clsx from 'clsx';
import { makeStyles, useTheme } from '@material-ui/core/styles';
import Input from '@material-ui/core/Input';
import InputLabel from '@material-ui/core/InputLabel';
import MenuItem from '@material-ui/core/MenuItem';
import FormControl from '@material-ui/core/FormControl';
import ListItemText from '@material-ui/core/ListItemText';
import Select from '@material-ui/core/Select';
import Checkbox from '@material-ui/core/Checkbox';
import Chip from '@material-ui/core/Chip';

import SearchBar from 'material-ui-search-bar'
import NumberFormat from 'react-number-format';
import TextField from '@material-ui/core/TextField';
import { Formik, Form, Field, ErrorMessage } from 'formik';




import InputAdornment from '@material-ui/core/InputAdornment';


import { Query } from "react-apollo";
import gql from "graphql-tag";


const useStyles = makeStyles(theme => ({
    root: {
      display: 'flex',
      flexWrap: 'wrap',
    },
    formControl: {
      margin: theme.spacing(1),
      minWidth: 120,
      maxWidth: 300,
    },
    chips: {
      display: 'flex',
      flexWrap: 'wrap',
    },
    chip: {
      margin: 2,
    },
    noLabel: {
      marginTop: theme.spacing(3),
    },
  }));
  
  const ITEM_HEIGHT = 48;
  const ITEM_PADDING_TOP = 8;
  const MenuProps = {
    PaperProps: {
      style: {
        maxHeight: ITEM_HEIGHT * 4.5 + ITEM_PADDING_TOP,
        width: 250,
      },
    },
  };
  
  function NumberFormatCustom(props) {
    const { inputRef, onChange, ...other } = props;
    console.log('props', props)
    return (
      <NumberFormat
        {...other}
        getInputRef={inputRef}
        onValueChange={values => {
          onChange({
            target: {
              value: values.value,
            },
          });
        }}
        thousandSeparator
        isNumericString
        prefix={props.value ? "$" : ""}
      />
    );
  }
  function getStyles(name, personName, theme) {
    return {
      fontWeight:
        personName.indexOf(name) === -1
          ? theme.typography.fontWeightRegular
          : theme.typography.fontWeightMedium,
    };
  }
const SearchForm = ({onSubmit}) => {
    const classes = useStyles();
    const theme = useTheme();

    const [values, setValues] = React.useState({
        numberformat: null
      });
    
    const [searchTerm, setSearchTerm] = React.useState();      
    //   const handleChange = prop => event => {
    //     setValues({ ...values, [prop]: event.target.value });
    //   };
      
      const handleFieldChange = name => event => {
        setValues({
          ...values,
          [name]: event.target.value,
        });
     };      
    const [personName, setPersonName] = React.useState([]);
  
    const landUseChange = event => {
        console.log('event', event)
      setPersonName(event.target.value);
    };
  
    // const handleChangeMultiple = event => {
    //   const { options } = event.target;
    //   const value = [];
    //   for (let i = 0, l = options.length; i < l; i += 1) {
    //     if (options[i].selected) {
    //       value.push(options[i].value);
    //     }
    //   }
    //   setPersonName(value);
    // };
        return <Query
          query={gql`
            {
              propertyLandUses {
                code
                description
              }   
            }                  
          `}
        >
          {({ loading, error, data }) => {
            if (loading) return <p>Loading...</p>;
            if (error) return <p>Error :(</p>;
      
  console.log('person', personName)
            return   <>    

            <Formik
      initialValues={{ searchTerm: '', landUseCode: [], minPrice: '' }}

      onSubmit={(values, { setSubmitting }) => {
        if (onSubmit) {
          onSubmit(values);
        }
        setTimeout(() => {
          alert(JSON.stringify(values, null, 2));
          setSubmitting(false);
        }, 400);
      }}
    >
      {({         
        values,
        errors,
        touched,
        handleChange,
        handleBlur,
        handleSubmit,
        isSubmitting }) => (
        <Form>
        <div style={{display: "flex", justifyContent: "space-between", margin: '0 auto', maxWidth: 800}}>
        <FormControl className={classes.formControl}>
        <InputLabel htmlFor="select-multiple">Land Use</InputLabel>
        <Select
          multiple
          name="landUseCode"
          value={values.landUseCode}
          onChange={handleChange}
          input={<Input id="select-multiple" />}

          MenuProps={MenuProps}
        >
          {data.propertyLandUses.map(propertyLandUse => (
            <MenuItem key={propertyLandUse.code} value={propertyLandUse} style={getStyles(propertyLandUse.code, personName, theme)}>
              {propertyLandUse.description}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
      <TextField
        className={classes.formControl}
        label="Min Price"
        name="minPrice"
        value={values.minPrice}
        onChange={handleChange}
        id="formatted-numberformat-input"

      />      
      </div>      

          <Field type="email" name="email"             onChange={handleChange}/>
          <ErrorMessage name="email" component="div" />
          <Field type="password" name="password" />
          <ErrorMessage name="password" component="div" />
          <button type="submit" disabled={isSubmitting}>
            Submit
          </button>
        </Form>
      )}
    </Formik>
              
            <SearchBar
            value={searchTerm}
            onChange={(value) => {
                console.log('onChange', value)
                setSearchTerm(value)
            }}
            onRequestSearch={() => console.log('onRequestSearch')}
            style={{
                margin: '0 auto',
                maxWidth: 800
            }}
            />
        <div style={{display: "flex", justifyContent: "space-between", margin: '0 auto', maxWidth: 800}}>
        <FormControl className={classes.formControl}>
        <InputLabel htmlFor="select-multiple">Land Use</InputLabel>
        <Select
          multiple
          value={personName}
          onChange={landUseChange}
          input={<Input id="select-multiple" />}

          MenuProps={MenuProps}
        >
          {data.propertyLandUses.map(propertyLandUse => (
            <MenuItem key={propertyLandUse.code} value={propertyLandUse} style={getStyles(propertyLandUse.code, personName, theme)}>
              {propertyLandUse.description}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
      <TextField
        className={classes.formControl}
        label="Min Price"
        value={values.numberformat}
        onChange={handleFieldChange('numberformat')}
        id="formatted-numberformat-input"
        InputProps={{
          inputComponent: NumberFormatCustom,
        }}
      />
      <TextField
        className={classes.formControl}
        label="Max Price"
        value={values.numberformat}
        onChange={handleFieldChange('numberformat')}
        id="formatted-numberformat-input"
        InputProps={{
          inputComponent: NumberFormatCustom,
        }}
      />   
      </div>   
      </>
          }}
        </Query>
      

}

export default SearchForm;