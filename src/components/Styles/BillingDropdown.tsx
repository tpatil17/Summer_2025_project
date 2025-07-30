import React from 'react';
import Select from 'react-select';
import { reactSelectCustomStyles } from './SelectStyle';

export type CategoryOption = {
  value: string;
  label: string;
};

const categoryOptions: CategoryOption[] = [

  { value: 'Daily', label: 'Daily' },
  { value: 'Weakly', label: 'Weakly' },  
  {value: 'Monthly', label: 'Monthly'},
  {value: 'Yearly', label: 'Yearly'},
];

interface Props {
  value: CategoryOption | null;
  onChange: (option: CategoryOption | null) => void;
  placeholder?: string;
  isClearable?: boolean;
}

const BillingSelect: React.FC<Props> = ({
  value,
  onChange,
  placeholder = 'Billing Frequency',
  isClearable = false,
}) => {
  return (
    <div className="w-full">
    <Select<CategoryOption>
        options={categoryOptions}
        value={value}
        onChange={onChange}
        styles={reactSelectCustomStyles}
        placeholder={placeholder}
        isClearable={isClearable}
    />
    </div>

  );
};

export default BillingSelect;

