import React from 'react';
import Select from 'react-select';
import { reactSelectCustomStyles } from './SelectStyle';

export type CategoryOption = {
  value: string;
  label: string;
};

const categoryOptions: CategoryOption[] = [
  { value: 'Groceries', label: 'Groceries' },
  { value: 'Transport', label: 'Transport' },
  { value: 'Entertainment', label: 'Entertainment' },
  { value: 'Utilities', label: 'Utilities' },
  { value: 'Food & Dining', label: 'Food & Dining' },
  { value: 'Health & Fitness', label: 'Health & Fitness' },
  { value: 'Shopping', label: 'Shopping' },
  { value: 'Income', label: 'Income' },
  { value: 'Other', label: 'Other' },
];

interface Props {
  value: CategoryOption | null;
  onChange: (option: CategoryOption | null) => void;
  placeholder?: string;
  isClearable?: boolean;
}

const CategorySelect: React.FC<Props> = ({
  value,
  onChange,
  placeholder = 'Select category',
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

export default CategorySelect;

