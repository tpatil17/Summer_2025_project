// src/styles/reactSelectStyles.ts
import type { StylesConfig } from 'react-select';
import type { CategoryOption } from "../Styles/SelectDropdown"; // adjust the path as needed
export const reactSelectCustomStyles: StylesConfig<CategoryOption, false> = {
  control: (base, state) => ({
    ...base,
    backgroundColor: 'white',
    borderColor: state.isFocused ? '#6366f1' : '#d1d5db',
    boxShadow: state.isFocused ? '0 0 0 1px #6366f1' : 'none',
    '&:hover': {
      borderColor: '#6366f1',
    },
    borderRadius: '0.5rem',
    minHeight: '2.5rem',
    paddingLeft: '0.25rem',
    paddingRight: '0.25rem',
    margin: 0, 
  }),
  menu: (base) => ({
    ...base,
    borderRadius: '0.5rem',
    backgroundColor: 'white',
    boxShadow: '0px 10px 15px -3px rgba(0,0,0,0.1)',
    zIndex: 20,
  }),
  option: (base, state) => ({
    ...base,
    backgroundColor: state.isSelected
      ? '#6366f1'
      : state.isFocused
      ? '#e0e7ff'
      : 'white',
    color: state.isSelected ? 'white' : '#1f2937',
    padding: '0.5rem 1rem',
    cursor: 'pointer',
  }),
  placeholder: (base) => ({
    ...base,
    color: '#9ca3af',
    fontSize: '0.875rem',
  }),
  singleValue: (base) => ({
    ...base,
    color: '#111827',
    fontSize: '0.875rem',
  }),
};
